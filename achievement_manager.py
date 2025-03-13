
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
    
    # ===== THÀNH TỰU CƠ BẢN =====
    
    # Thành tựu "Người mới bắt đầu" - luôn trả về True để đảm bảo được cấp cho tất cả người dùng
    if achievement_name == "Người mới bắt đầu":
        return True
    
    # Thành tựu "Chào mừng trở lại"
    if achievement_name == "Chào mừng trở lại":
        # Đơn giản hóa: cho phép đạt được để demo
        return True
    
    # Thành tựu "Người trung thành"
    if achievement_name == "Người trung thành":
        # Đối với mục đích demo
        if hasattr(user, 'daily_streak'):
            return user.daily_streak >= 30
        # Cho phép đạt được cho demo
        return False
    
    # ===== THÀNH TỰU LIÊN QUAN ĐẾN KINH NGHIỆM/XU =====
    
    # Thành tựu "Ngôi sao mới nổi"
    if achievement_name == "Ngôi sao mới nổi":
        return user.experience >= 100
    
    # Thành tựu "Người giàu có"
    if achievement_name == "Người giàu có":
        return user.coins >= 500
    
    # Thành tựu "Triệu phú"
    if achievement_name == "Triệu phú":
        return user.coins >= 1000
    
    # ===== THÀNH TỰU LIÊN QUAN ĐẾN QUIZ =====
    
    # Thành tựu "Lần đầu làm quiz"
    if achievement_name == "Lần đầu làm quiz":
        # Kiểm tra tổng số câu hỏi đã trả lời
        return user.total_questions_answered > 0
    
    # Thành tựu "Học sinh chăm chỉ"
    if achievement_name == "Học sinh chăm chỉ":
        # Kiểm tra tổng số câu hỏi đã trả lời
        return user.total_questions_answered >= 10
    
    # Thành tựu "Lựa chọn đúng đắn"
    if achievement_name == "Lựa chọn đúng đắn":
        # Kiểm tra trong DB số lần sử dụng Skip Question
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
        if hasattr(user, 'easy_questions_completed') and hasattr(user, 'easy_questions_correct'):
            return user.easy_questions_completed > 0 and user.easy_questions_correct < user.easy_questions_completed
        return False
    
    # ===== THÀNH TỰU LIÊN QUAN ĐẾN ĐÓNG GÓP =====
    
    # Thành tựu "Đóng góp đầu tiên"
    if achievement_name == "Đóng góp đầu tiên":
        from models import Contribution
        contribution_count = Contribution.query.filter_by(user_id=user.id).count()
        return contribution_count > 0
    
    # Thành tựu "Người sáng tạo"
    if achievement_name == "Người sáng tạo":
        from models import Contribution
        approved_contributions = Contribution.query.filter_by(
            user_id=user.id, 
            approved=True
        ).count()
        return approved_contributions >= 5
    
    # ===== THÀNH TỰU ĐẶC BIỆT =====
    
    # Thành tựu "1 năm bên nhau"
    if achievement_name == "1 năm bên nhau":
        # Đối với mục đích demo, ta có thể giả định rằng người dùng đã đạt được
        if hasattr(user, 'daily_streak'):
            return user.daily_streak >= 365
        return False
    
    # Thành tựu "Chắc chắn đúng"
    if achievement_name == "Chắc chắn đúng":
        from models import InventoryItem
        fiftyfifty_used = InventoryItem.query.filter_by(
            user_id=user.id, 
            item_name="50/50", 
            is_used=True
        ).count()
        return fiftyfifty_used >= 2
    
    # Mặc định: không đạt được thành tựu
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
