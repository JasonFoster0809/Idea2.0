
from datetime import datetime, timedelta
from flask_login import current_user
from models import User, UserAchievement, Achievement, db
from achievements import ACHIEVEMENTS

def check_achievements(user_id):
    """Kiểm tra và cấp thành tựu cho người dùng"""
    if not user_id:
        return []
    
    user = User.query.get(user_id)
    if not user:
        return []
    
    new_achievements = []
    
    # Lấy tất cả thành tựu từ cơ sở dữ liệu, nếu chưa có thì tạo mới
    db_achievements = Achievement.query.all()
    if not db_achievements:
        initialize_achievements()
        db_achievements = Achievement.query.all()
    
    # Lấy các thành tựu người dùng đã đạt được
    user_achievements = UserAchievement.query.filter_by(user_id=user_id).all()
    achieved_ids = [ua.achievement_id for ua in user_achievements]
    
    # Kiểm tra từng thành tựu
    for achievement in db_achievements:
        # Bỏ qua nếu đã đạt được
        if achievement.id in achieved_ids:
            continue
        
        # Kiểm tra điều kiện đạt thành tựu
        if check_achievement_conditions(user, achievement):
            # Cấp thành tựu
            award_achievement(user, achievement)
            new_achievements.append(achievement)
    
    return new_achievements

def initialize_achievements():
    """Khởi tạo dữ liệu thành tựu trong cơ sở dữ liệu"""
    from achievements import ACHIEVEMENTS
    
    for achievement_data in ACHIEVEMENTS:
        achievement = Achievement(
            name=achievement_data["name"],
            description=achievement_data["description"],
            icon=achievement_data["icon"],
            xp_reward=achievement_data["xp_reward"],
            coin_reward=achievement_data["coin_reward"],
            item_reward=achievement_data["item_reward"]
        )
        db.session.add(achievement)
    
    db.session.commit()

def check_achievement_conditions(user, achievement):
    """Kiểm tra điều kiện đạt thành tựu cụ thể"""
    achievement_name = achievement.name
    
    # Thành tựu "1 năm bên nhau"
    if achievement_name == "1 năm bên nhau":
        # Đếm số ngày đăng nhập
        # Trong thực tế, cần lưu lịch sử đăng nhập, nhưng ở đây giả định qua daily_streak
        return user.daily_streak >= 365
    
    # Thành tựu "Lựa chọn đúng đắn"
    if achievement_name == "Lựa chọn đúng đắn":
        # Kiểm tra trong DB hoặc thông qua session
        # Giả định thông qua một trường trong Use
        from models import InventoryItem
        skips_used = InventoryItem.query.filter_by(
            user_id=user.id, 
            item_name="Skip Question",
            is_used=True
        ).count()
        return skips_used > 0
    
    # Thành tựu "Ơ kìa..."
    if achievement_name == "Ơ kìa...":
        # Kiểm tra số câu sai trong câu hỏi dễ
        # Cần theo dõi trong quá trình làm quiz
        total_easy = user.easy_questions_completed
        correct_easy = total_easy - (total_easy * 0.2)  # Giả định 20% là đúng
        return total_easy > 0 and correct_easy < total_easy
    
    # Thành tựu "Học bá"
    if achievement_name == "Học bá":
        # Kiểm tra điểm số perfect trên các môn học
        # Cần lưu lịch sử làm bài chi tiết
        perfect_score_count = 0
        # Trong thực tế, kiểm tra từ bảng lưu lịch sử quiz
        # Nhưng ở đây, ta giả định thông qua tỷ lệ đúng/tổng số câu khó
        if user.hard_questions_completed >= 50 and user.correct_answers / user.total_questions_answered > 0.9:
            perfect_score_count = 1  # Giả định đạt yêu cầu
        return perfect_score_count >= 1
    
    # Thành tựu "Chắc chắn đúng"
    if achievement_name == "Chắc chắn đúng":
        # Kiểm tra trong session hoặc lưu lịch sử sử dụng item
        # Giả định qua trường trong User
        from models import InventoryItem
        double_5050_used = InventoryItem.query.filter_by(
            user_id=user.id, 
            item_name="50/50", 
            is_used=True
        ).count()
        return double_5050_used >= 2
    
    return False

def award_achievement(user, achievement):
    """Cấp thành tựu cho người dùng"""
    if not user or not achievement:
        return False
    
    # Kiểm tra xem đã có thành tựu này chưa
    existing = UserAchievement.query.filter_by(
        user_id=user.id,
        achievement_id=achievement.id
    ).first()
    
    if existing:
        return False
    
    # Tạo thành tựu mới
    new_achievement = UserAchievement(
        user_id=user.id,
        achievement_id=achievement.id,
        acquired_date=datetime.utcnow(),
        notified=False
    )
    
    # Thêm phần thưởng
    if achievement.xp_reward:
        user.add_experience(achievement.xp_reward)
    
    if achievement.coin_reward:
        user.add_coins(achievement.coin_reward)
    
    # Thêm vật phẩm phần thưởng nếu có
    if achievement.item_reward:
        from models import InventoryItem
        
        # Kiểm tra xem đã có vật phẩm này chưa
        existing_item = InventoryItem.query.filter_by(
            user_id=user.id,
            item_name=achievement.item_reward
        ).first()
        
        if existing_item:
            existing_item.quantity += 1
        else:
            new_item = InventoryItem(
                user_id=user.id,
                item_name=achievement.item_reward,
                quantity=1
            )
            db.session.add(new_item)
    
    db.session.add(new_achievement)
    db.session.commit()
    
    return True
