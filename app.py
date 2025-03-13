import os
from flask import Flask, render_template, flash, redirect, url_for, request, jsonify, abort
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
import models
from flask_login import LoginManager, login_user, current_user, logout_user, login_required
from datetime import datetime

# Create Flask app
app = Flask(__name__)

# Configure database
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'quiz.db')
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "default_secret_key")

# Ensure instance directory exists and has write permissions
instance_dir = os.path.dirname(db_path)
os.makedirs(instance_dir, exist_ok=True)

# Set proper permissions on the instance directory
try:
    os.chmod(instance_dir, 0o777)
except Exception as e:
    print(f"Warning: Unable to set permissions on instance directory: {e}")

# Check if DB exists and if it's writable
if os.path.exists(db_path):
    try:
        # Try to open the file in write mode to check if it's writable
        with open(db_path, 'a'):
            pass
    except PermissionError:
        # If we can't write to it, remove it so a new one will be created
        try:
            os.remove(db_path)
            print(f"Removed read-only database file at {db_path}")
        except Exception as e:
            print(f"Warning: Unable to remove read-only database: {e}")

# Initialize database
db.init_app(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

# Create all tables
with app.app_context():
    db.create_all()

@app.route('/')
def homepage():
    from models import User, RANK_THRESHOLDS
    top_users = User.query.order_by(User.experience.desc()).limit(10).all()
    return render_template('homepage.html', top_users=top_users, RANK_THRESHOLDS=RANK_THRESHOLDS)

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('login.html', register=True)

@app.route('/register', methods=['POST'])
def register_post():
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    confirm_password = request.form.get('confirm_password')

    if password != confirm_password:
        flash('Passwords do not match!')
        return redirect(url_for('register'))

    from models import User
    user = User.query.filter_by(username=username).first()
    if user:
        flash('Username already exists!')
        return redirect(url_for('register'))

    user = User.query.filter_by(email=email).first()
    if user:
        flash('Email already exists!')
        return redirect(url_for('register'))

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    # Give the user the "Người mới bắt đầu" achievement
    from models import Achievement, UserAchievement
    achievement = Achievement.query.filter_by(name="Người mới bắt đầu").first()
    if achievement:
        user_achievement = UserAchievement(user_id=new_user.id, achievement_id=achievement.id)
        db.session.add(user_achievement)
        db.session.commit()

    flash('Registration successful! Please log in.')
    return redirect(url_for('login'))

@app.route('/login', methods=['POST'])
def login_post():
    username = request.form.get('username')
    password = request.form.get('password')

    from models import User
    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password_hash, password):
        flash('Please check your login details and try again.')
        return redirect(url_for('login'))

    login_user(user)
    return redirect(url_for('homepage'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('homepage'))

# Add more routes as needed


@app.route('/mainquiz')
@login_required
def mainquiz():
    from models import Question
    subjects = db.session.query(Question.subject).distinct().all()
    subjects = [subject[0] for subject in subjects]
    return render_template('mainquiz.html', subjects=subjects)

@app.route('/contribute')
@login_required
def contribute():
    return render_template('contribute.html')

@app.route('/api/check-achievements')
@login_required
def check_user_achievements():
    """Kiểm tra nếu người dùng đạt được thành tựu mới"""
    from achievement_manager import check_achievements
    
    # Kiểm tra thành tựu mới
    new_achievements = check_achievements(current_user.id)
    
    # Chuyển đổi thành tựu thành JSON
    achievement_data = []
    for achievement in new_achievements:
        achievement_data.append({
            'id': achievement.id,
            'name': achievement.name,
            'description': achievement.description,
            'xp_reward': achievement.xp_reward,
            'coin_reward': achievement.coin_reward,
            'item_reward': achievement.item_reward,
            'icon': achievement.icon
        })
    
    return jsonify({
        'new_achievements': achievement_data,
        'success': True
    })

@app.route('/contribute', methods=['POST'])
@login_required
def contribute_post():
    import os
    from werkzeug.utils import secure_filename
    from models import Contribution

    # Create uploads directory if it doesn't exist
    upload_folder = os.path.join(app.static_folder, 'uploads')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    subject = request.form.get('subject')
    grade = request.form.get('grade')
    question_type = request.form.get('question_input_type')
    question = request.form.get('question', '')
    option_a = request.form.get('option_a')
    option_b = request.form.get('option_b')
    option_c = request.form.get('option_c')
    option_d = request.form.get('option_d')
    correct_answer = request.form.get('correct_answer')
    explanation_type = request.form.get('explanation_input_type')
    explanation = request.form.get('explanation', '')

    # Handle question image upload
    question_image_url = None
    if 'question_image' in request.files and request.files['question_image'].filename != '':
        question_image = request.files['question_image']
        filename = secure_filename(question_image.filename)
        # Create unique filename to avoid duplicates
        unique_filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        question_image.save(file_path)
        question_image_url = f"/static/uploads/{unique_filename}"

    # Handle explanation image upload
    explanation_image_url = None
    if 'explanation_image' in request.files and request.files['explanation_image'].filename != '':
        explanation_image = request.files['explanation_image']
        filename = secure_filename(explanation_image.filename)
        # Create unique filename to avoid duplicates
        unique_filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        explanation_image.save(file_path)
        explanation_image_url = f"/static/uploads/{unique_filename}"

    # Create new contribution
    new_contribution = Contribution(
        user_id=current_user.id,
        subject=subject,
        grade=grade,
        question=question,
        question_image_url=question_image_url,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        correct_answer=correct_answer,
        explanation=explanation,
        explanation_image_url=explanation_image_url,
        approved=False
    )

    db.session.add(new_contribution)
    db.session.commit()

    flash('Câu hỏi của bạn đã được gửi và đang chờ phê duyệt!')
    return redirect(url_for('my_contributions'))

@app.route('/my_contributions')
@login_required
def my_contributions():
    from models import Contribution
    contributions = Contribution.query.filter_by(user_id=current_user.id).all()
    return render_template('my_contributions.html', contributions=contributions)

@app.route('/admin_dashboard')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        abort(403)

    from models import User, Contribution, Question
    total_users = User.query.count()
    new_users_list = User.query.order_by(User.id.desc()).limit(5).all()
    new_users_count = len(new_users_list)
    pending_contributions = Contribution.query.filter_by(approved=False).count()
    total_questions = Question.query.count()

    # Get top contributors
    contributors = db.session.query(Contribution.user_id, db.func.count(Contribution.id)).group_by(Contribution.user_id).order_by(db.func.count(Contribution.id).desc()).limit(5).all()
    top_contributors = []
    for user_id, count in contributors:
        user = User.query.get(user_id)
        if user:
            top_contributors.append((user, count))

    return render_template('admin/dashboard.html', 
                          total_users=total_users, 
                          new_users=new_users_count, 
                          pending_contributions=pending_contributions, 
                          total_questions=total_questions,
                          top_contributors=top_contributors,
                          new_users_list=new_users_list)

@app.route('/event')
@login_required
def event():
    return render_template('event.html')

@app.route('/shop')
@login_required
def shop():
    return render_template('shop.html')

@app.route('/inventory')
@login_required
def inventory():
    from models import InventoryItem
    inventory_items = InventoryItem.query.filter_by(user_id=current_user.id).all()
    return render_template('inventory.html', inventory_items=inventory_items)

@app.route('/advancements')
@login_required
def advancements():
    from achievements import get_achievements_by_category
    achievements = get_achievements_by_category()
    return render_template('advancements.html', achievements=achievements)

@app.route('/daily_quests')
@login_required
def daily_quests():
    return render_template('daily_quests.html')

@app.route('/admin_users')
@login_required
def admin_users():
    if not current_user.is_admin:
        abort(403)

    from models import User
    users = User.query.all()
    return render_template('admin/users.html', users=users)

@app.route('/admin_contributions')
@login_required
def admin_contributions():
    if not current_user.is_admin:
        abort(403)

    from models import Contribution
    # Chỉ lấy những đóng góp chưa được duyệt
    contributions = Contribution.query.filter_by(approved=False).all()
    return render_template('admin/contributions.html', contributions=contributions)

@app.route('/admin_fortune_cookies')
@login_required
def admin_fortune_cookies():
    if not current_user.is_admin:
        abort(403)

    return render_template('admin/fortune_cookies.html')

@app.route('/admin_question_bank')
@login_required
def admin_question_bank():
    if not current_user.is_admin:
        abort(403)

    from models import Question
    questions = Question.query.all()
    return render_template('admin/question_bank.html', questions=questions)

@app.route('/edit_user/<int:user_id>', methods=['POST'])
@login_required
def edit_user(user_id):
    if not current_user.is_admin:
        abort(403)

    from models import User
    user = User.query.get_or_404(user_id)

    user.username = request.form.get('username')
    user.email = request.form.get('email')
    user.coins = int(request.form.get('coins'))
    user.experience = int(request.form.get('experience'))

    db.session.commit()

    flash(f'Thông tin người dùng {user.username} đã được cập nhật!')
    return redirect(url_for('admin_users'))

@app.route('/toggle_admin/<int:user_id>', methods=['POST'])
@login_required
def toggle_admin(user_id):
    if not current_user.is_admin:
        abort(403)

    from models import User
    user = User.query.get_or_404(user_id)

    # Toggle admin status
    user.is_admin = not user.is_admin
    db.session.commit()

    action = "cấp" if user.is_admin else "hủy"
    flash(f'Đã {action} quyền admin cho {user.username}!')
    return redirect(url_for('admin_users'))

@app.route('/approve_contribution/<int:id>', methods=['POST'])
@login_required
def approve_contribution(id):
    if not current_user.is_admin:
        abort(403)

    from models import Contribution, Question, User
    contribution = Contribution.query.get_or_404(id)
    
    # Kiểm tra xem đóng góp đã được duyệt chưa
    if contribution.approved:
        flash(f'Câu hỏi #{id} đã được duyệt trước đó!')
        return redirect(url_for('admin_contributions'))

    # Create new question from contribution
    new_question = Question(
        subject=contribution.subject,
        grade=contribution.grade,
        question_text=contribution.question,
        option_a=contribution.option_a,
        option_b=contribution.option_b,
        option_c=contribution.option_c,
        option_d=contribution.option_d,
        correct_answer=contribution.correct_answer,
        explanation=contribution.explanation,
        difficulty="medium",  # Adding a default difficulty as it's required but not in contributions
        question_image_url=contribution.question_image_url,
        explanation_image_url=contribution.explanation_image_url
    )

    # Mark contribution as approved
    contribution.approved = True

    # Thưởng cho người đóng góp
    contributor = User.query.get(contribution.user_id)
    if contributor:
        contributor.add_coins(10)  # Thưởng 10 xu cho mỗi đóng góp được duyệt
        contributor.add_experience(20)  # Thưởng 20 XP

    db.session.add(new_question)
    db.session.commit()

    flash(f'Đã phê duyệt câu hỏi #{id} và thưởng cho người đóng góp!')
    return redirect(url_for('admin_contributions'))

@app.route('/reject_contribution/<int:id>', methods=['POST'])
@login_required
def reject_contribution(id):
    if not current_user.is_admin:
        abort(403)

    from models import Contribution
    contribution = Contribution.query.get_or_404(id)

    # Delete the contribution
    db.session.delete(contribution)
    db.session.commit()

    flash(f'Đã từ chối và xóa câu hỏi #{id}!')
    return redirect(url_for('admin_contributions'))

@app.route('/edit_contribution/<int:id>', methods=['POST'])
@login_required
def edit_contribution(id):
    if not current_user.is_admin:
        abort(403)

    from models import Contribution
    contribution = Contribution.query.get_or_404(id)

    # Update contribution data
    contribution.question = request.form.get('question')
    contribution.option_a = request.form.get('option_a')
    contribution.option_b = request.form.get('option_b')
    contribution.option_c = request.form.get('option_c')
    contribution.option_d = request.form.get('option_d')
    contribution.correct_answer = request.form.get('correct_answer')
    contribution.explanation = request.form.get('explanation')

    db.session.commit()

    flash(f'Đã cập nhật câu hỏi #{id}!')
    return redirect(url_for('admin_contributions'))

@app.route('/edit_question/<int:id>', methods=['POST'])
@login_required
def edit_question(id):
    if not current_user.is_admin:
        abort(403)

    import os
    from werkzeug.utils import secure_filename
    from models import Question
    question = Question.query.get_or_404(id)

    # Tạo thư mục uploads nếu chưa tồn tại
    upload_folder = os.path.join(app.static_folder, 'uploads')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # Xử lý tải lên hình ảnh câu hỏi
    if 'question_image' in request.files and request.files['question_image'].filename != '':
        question_image = request.files['question_image']
        filename = secure_filename(question_image.filename)
        # Tạo tên file độc nhất để tránh trùng lặp
        unique_filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        question_image.save(file_path)
        question.question_image_url = f"/static/uploads/{unique_filename}"

    # Xử lý tải lên hình ảnh giải thích
    if 'explanation_image' in request.files and request.files['explanation_image'].filename != '':
        explanation_image = request.files['explanation_image']
        filename = secure_filename(explanation_image.filename)
        # Tạo tên file độc nhất để tránh trùng lặp
        unique_filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        explanation_image.save(file_path)
        question.explanation_image_url = f"/static/uploads/{unique_filename}"

    # Update question data
    question.subject = request.form.get('subject')
    question.grade = request.form.get('grade')
    question.difficulty = request.form.get('difficulty')
    question.question_text = request.form.get('question_text')
    question.option_a = request.form.get('option_a')
    question.option_b = request.form.get('option_b')
    question.option_c = request.form.get('option_c')
    question.option_d = request.form.get('option_d')
    question.correct_answer = request.form.get('correct_answer')
    question.explanation = request.form.get('explanation')

    db.session.commit()

    flash(f'Đã cập nhật câu hỏi #{id}!')
    return redirect(url_for('admin_question_bank'))

@app.route('/delete_question/<int:id>', methods=['POST'])
@login_required
def delete_question(id):
    if not current_user.is_admin:
        abort(403)

    from models import Question
    question = Question.query.get_or_404(id)

    # Delete the question
    db.session.delete(question)
    db.session.commit()

    flash(f'Đã xóa câu hỏi #{id}!')
    return redirect(url_for('admin_question_bank'))

@app.route('/api/purchase', methods=['POST'])
@login_required
def purchase_item():
    data = request.json
    item = data.get('item')
    cost = data.get('cost')

    if not item or not cost:
        return jsonify({'success': False, 'message': 'Missing item or cost'})

    if current_user.coins < cost:
        return jsonify({'success': False, 'message': 'Không đủ tiền!'})

    # Deduct coins from user
    current_user.coins -= cost

    # Add item to user's inventory
    from models import InventoryItem

    # Check if item already exists in inventory
    existing_item = InventoryItem.query.filter_by(
        user_id=current_user.id, 
        item_name=item
    ).first()

    if existing_item:
        existing_item.quantity += 1
    else:
        new_item = InventoryItem(
            user_id=current_user.id,
            item_name=item,
            quantity=1
        )
        db.session.add(new_item)

    db.session.commit()

    return jsonify({
        'success': True, 
        'message': f'Đã mua {item} thành công!',
        'newBalance': current_user.coins
    })

@app.route('/api/gacha', methods=['GET'])
@login_required
def get_gacha_rewards():
    # Simulating getting 8 random rewards for the gacha system
    rewards = [
        {
            'name': 'Bánh may mắn',
            'description': 'Vận may sẽ mỉm cười với bạn',
            'message': 'Phần thưởng đặc biệt đang chờ đợi bạn',
            'item': 'Lucky Cookie'
        },
        {
            'name': '50 xu',
            'description': 'Một số xu để tiêu',
            'message': 'Hãy tiêu thật khôn ngoan!',
            'item': '50 Coins'
        },
        {
            'name': 'Quyền trợ giúp 50/50',
            'description': 'Loại bỏ 2 phương án sai trong câu hỏi',
            'message': 'Sử dụng nó khi bạn thực sự cần',
            'item': '50/50'
        },
        {
            'name': 'Bỏ qua câu hỏi',
            'description': 'Bỏ qua một câu hỏi khó',
            'message': 'Đôi khi bỏ qua là sự khôn ngoan',
            'item': 'Skip Question'
        },
        {
            'name': 'Tăng EXP',
            'description': 'Nhận thêm 20% EXP cho câu hỏi kế tiếp',
            'message': 'Kiến thức là sức mạnh!',
            'item': 'XP Boost'
        },
        {
            'name': 'Mũ học giả',
            'description': 'Một món trang sức cho avatar của bạn',
            'message': 'Tri thức làm nên con người',
            'item': 'Scholar Hat'
        },
        {
            'name': 'Tài liệu học tập',
            'description': 'Giúp bạn học tập hiệu quả hơn',
            'message': 'Hãy đọc và khám phá thế giới!',
            'item': 'Study Material'
        },
        {
            'name': 'Vé tham gia sự kiện',
            'description': 'Tham gia sự kiện đặc biệt không mất phí',
            'message': 'Sự kiện đặc biệt đang chờ đợi bạn!',
            'item': 'Event Ticket'
        }
    ]

    import random
    random.shuffle(rewards)

    return jsonify({
        'success': True,
        'rewards': rewards
    })

@app.route('/api/gacha/select', methods=['POST'])
@login_required
def select_gacha_reward():
    data = request.json
    index = data.get('index')
    reward = data.get('reward')

    if reward and 'item' in reward:
        # Add reward to inventory
        from models import InventoryItem

        # If reward is coins, add directly to user balance
        if '50 Coins' == reward['item']:
            current_user.coins += 50
        else:
            # Check if item already exists in inventory
            existing_item = InventoryItem.query.filter_by(
                user_id=current_user.id, 
                item_name=reward['item']
            ).first()

            if existing_item:
                existing_item.quantity += 1
            else:
                new_item = InventoryItem(
                    user_id=current_user.id,
                    item_name=reward['item'],
                    quantity=1
                )
                db.session.add(new_item)

        db.session.commit()

    return jsonify({
        'success': True
    })

@app.route('/api/update-profile', methods=['POST'])
@login_required
def update_profile():
    data = request.json
    custom_type = data.get('type')
    option = data.get('option')
    cost = data.get('cost')

    if not custom_type or not option or not cost:
        return jsonify({'success': False, 'message': 'Missing data'})

    if current_user.coins < cost:
        return jsonify({'success': False, 'message': 'Không đủ tiền!'})

    # Update user profile
    from models import UserProfile

    # Get user profile or create new one
    profile = UserProfile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.session.add(profile)

    # Update profile based on customization type
    if custom_type == 'hair':
        profile.hair_style = option
    elif custom_type == 'skin':
        profile.skin_color = option
    elif custom_type == 'accessory':
        profile.accessory = option

    # Deduct coins from user
    current_user.coins -= cost

    db.session.commit()

    return jsonify({
        'success': True,
        'newBalance': current_user.coins
    })


@app.route('/add_question', methods=['POST'])
@login_required
def add_question():
    if not current_user.is_admin:
        abort(403)

    import os
    from werkzeug.utils import secure_filename
    from models import Question

    # Tạo thư mục uploads nếu chưa tồn tại
    upload_folder = os.path.join(app.static_folder, 'uploads')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # Xử lý tải lên hình ảnh câu hỏi
    question_image_url = None
    if 'question_image' in request.files and request.files['question_image'].filename != '':
        question_image = request.files['question_image']
        filename = secure_filename(question_image.filename)
        # Tạo tên file độc nhất để tránh trùng lặp
        unique_filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        question_image.save(file_path)
        question_image_url = f"/static/uploads/{unique_filename}"

    # Xử lý tải lên hình ảnh giải thích
    explanation_image_url = None
    if 'explanation_image' in request.files and request.files['explanation_image'].filename != '':
        explanation_image = request.files['explanation_image']
        filename = secure_filename(explanation_image.filename)
        # Tạo tên file độc nhất để tránh trùng lặp
        unique_filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)
        explanation_image.save(file_path)
        explanation_image_url = f"/static/uploads/{unique_filename}"

    # Create new question
    new_question = Question(
        subject=request.form.get('subject'),
        grade=int(request.form.get('grade')),
        difficulty=request.form.get('difficulty'),
        question_text=request.form.get('question_text'),
        option_a=request.form.get('option_a'),
        option_b=request.form.get('option_b'),
        option_c=request.form.get('option_c'),
        option_d=request.form.get('option_d'),
        correct_answer=request.form.get('correct_answer'),
        explanation=request.form.get('explanation'),
        question_image_url=question_image_url,
        explanation_image_url=explanation_image_url
    )

    db.session.add(new_question)
    db.session.commit()

    flash('Đã thêm câu hỏi mới thành công!')
    return redirect(url_for('admin_question_bank'))

@app.route('/api/user-info')
@login_required
def get_user_info():
    """Trả về thông tin người dùng hiện tại"""
    user_data = {
        'id': current_user.id,
        'username': current_user.username,
        'coins': current_user.coins,
        'experience': current_user.experience,
        'rank': current_user.rank,
        'success': True
    }
    return jsonify(user_data)

@app.route('/api/use-item', methods=['POST'])
@login_required
def use_item():
    """API để sử dụng một vật phẩm trong inventory"""
    data = request.json
    item_name = data.get('item_name')
    question_id = data.get('question_id')
    
    if not item_name:
        return jsonify({'success': False, 'message': 'Thiếu tên vật phẩm'})
    
    from models import InventoryItem
    item = InventoryItem.query.filter_by(user_id=current_user.id, item_name=item_name).first()
    
    if not item or item.quantity <= 0:
        return jsonify({'success': False, 'message': 'Bạn không có vật phẩm này'})
    
    # Xử lý logic sử dụng vật phẩm dựa trên loại
    result = {'success': True, 'message': f'Đã sử dụng {item_name}'}
    
    # Logic xử lý các vật phẩm cụ thể
    if item_name == "50/50":
        # Logic loại bỏ 2 đáp án sai
        result['eliminated_options'] = ['B', 'C']  # Ví dụ
    elif item_name == "Skip Question":
        # Logic bỏ qua câu hỏi
        result['skip'] = True
    
    # Đánh dấu vật phẩm đã sử dụng (để theo dõi cho thành tựu)
    item.is_used = True
    
    # Giảm số lượng
    item.quantity -= 1
    if item.quantity <= 0:
        db.session.delete(item)
    
    db.session.commit()
    
    # Kiểm tra nếu có thành tựu mới
    from achievement_manager import check_achievements
    new_achievements = check_achievements(current_user.id)
    
    # Chuyển đổi thành tựu thành JSON
    achievement_data = []
    for achievement in new_achievements:
        achievement_data.append({
            'id': achievement.id,
            'name': achievement.name,
            'description': achievement.description,
            'xp_reward': achievement.xp_reward,
            'coin_reward': achievement.coin_reward,
            'item_reward': achievement.item_reward,
            'icon': achievement.icon
        })
    
    result['new_achievements'] = achievement_data
    
    return jsonify(result)