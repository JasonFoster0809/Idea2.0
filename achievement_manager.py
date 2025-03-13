
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
    
    # Kiểm tra các trường hợp đặc biệt trước
    
    # Thành tựu "Người mới bắt đầu" - luôn trả về True để đảm bảo được cấp
    if achievement_name == "Người mới bắt đầu":
        return True
    
    # Thành tựu "1 năm bên nhau"
    if achievement_name == "1 năm bên nhau":
        # Đếm số ngày đăng nhập
        # Đối với mục đích demo, ta có thể giả định rằng người dùng đã đạt được
        if hasattr(user, 'daily_streak'):
            return user.daily_streak >= 365
        return False
    
    # Thành tựu "Lựa chọn đúng đắn"
    if achievement_name == "Lựa chọn đúng đắn":
        # Kiểm tra trong DB số lần sử dụng Skip Question
        from models import InventoryItem, UserQuizHistory
        skips_used = InventoryItem.query.filter_by(
            user_id=user.id, 
            item_name="Skip Question",
            is_used=True
        ).count()
        # Hoặc kiểm tra lịch sử quiz nếu có
        if hasattr(user, 'has_skipped_hard_question'):
            return user.has_skipped_hard_question
        return skips_used > 0
    
    # Thành tựu "Ơ kìa..."
    if achievement_name == "Ơ kìa...":
        # Kiểm tra số câu sai trong câu hỏi dễ
        if hasattr(user, 'easy_questions_completed') and hasattr(user, 'easy_questions_correct'):
            return user.easy_questions_completed > 0 and user.easy_questions_correct < user.easy_questions_completed
        # Nếu không có thông tin chi tiết, kiểm tra flag
        if hasattr(user, 'has_failed_easy_question'):
            return user.has_failed_easy_question
        return False
    
    # Thành tựu "Học bá"
    if achievement_name == "Học bá":
        # Kiểm tra điểm số perfect trên các môn học
        if hasattr(user, 'perfect_hard_quiz_count'):
            return user.perfect_hard_quiz_count >= 1
        # Kiểm tra tỷ lệ đúng/sai cho câu hỏi khó nếu có thông tin
        if hasattr(user, 'hard_questions_completed') and hasattr(user, 'hard_questions_correct'):
            return user.hard_questions_completed >= 10 and user.hard_questions_correct >= 10
        return False
    
    # Thành tựu "Chắc chắn đúng"
    if achievement_name == "Chắc chắn đúng":
        # Kiểm tra trong DB số lần sử dụng 50/50
        from models import InventoryItem
        fiftyfifty_used = InventoryItem.query.filter_by(
            user_id=user.id, 
            item_name="50/50", 
            is_used=True
        ).count()
        # Hoặc kiểm tra flag
        if hasattr(user, 'has_used_double_fiftyfifty'):
            return user.has_used_double_fiftyfifty
        return fiftyfifty_used >= 2
    
    # Các thành tựu khác có thể thêm vào tùy theo yêu cầu
    # ...
    
    # Kiểm tra thành tựu dựa trên số liệu thống kê
    
    # Thành tựu liên quan đến đóng góp
    if achievement_name == "Đóng góp đầu tiên":
        from models import Contribution
        contribution_count = Contribution.query.filter_by(user_id=user.id).count()
        return contribution_count > 0
    
    if achievement_name == "Người sáng tạo":
        from models import Contribution
        approved_contributions = Contribution.query.filter_by(
            user_id=user.id, 
            approved=True
        ).count()
        return approved_contributions >= 5
    
    # Thành tựu liên quan đến quiz
    if achievement_name == "Lần đầu làm quiz":
        if hasattr(user, 'total_quizzes'):
            return user.total_quizzes > 0
        return False
    
    if achievement_name == "Học sinh chăm chỉ":
        if hasattr(user, 'total_quizzes'):
            return user.total_quizzes >= 10
        return False
    
    # Thành tựu liên quan đến kinh nghiệm/xu
    if achievement_name == "Ngôi sao mới nổi":
        return user.experience >= 100
    
    if achievement_name == "Người giàu có":
        return user.coins >= 500
    
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
