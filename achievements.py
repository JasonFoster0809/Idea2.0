
"""
File chứa dữ liệu thành tựu cho hệ thống
"""

ACHIEVEMENTS = [
    # GENERAL ACHIEVEMENTS - 15 thành tựu tổng hợp
    {
        "name": "Người mới bắt đầu",
        "description": "Đăng ký tài khoản thành công",
        "icon": "new_user.png",
        "xp_reward": 10,
        "coin_reward": 5,
        "item_reward": None,
        "category": "general"
    },
    {
        "name": "Chào mừng trở lại",
        "description": "Đăng nhập 5 ngày liên tiếp",
        "icon": "welcome_back.png",
        "xp_reward": 25,
        "coin_reward": 10,
        "item_reward": None,
        "category": "general"
    },
    {
        "name": "Người trung thành",
        "description": "Đăng nhập 30 ngày liên tiếp",
        "icon": "loyal_user.png",
        "xp_reward": 100,
        "coin_reward": 50,
        "item_reward": "Huy hiệu Trung thành",
        "category": "general"
    },
    {
        "name": "Nhà thám hiểm",
        "description": "Truy cập ít nhất 3 trang trong ứng dụng",
        "icon": "explorer.png",
        "xp_reward": 30,
        "coin_reward": 15,
        "item_reward": None,
        "category": "general"
    },
    {
        "name": "Sinh nhật vui vẻ",
        "description": "Đăng nhập vào ngày sinh nhật của bạn",
        "icon": "birthday.png",
        "xp_reward": 50,
        "coin_reward": 25,
        "item_reward": "Bánh sinh nhật",
        "category": "general"
    },
    {
        "name": "Ngôi sao mới nổi",
        "description": "Đạt 100 điểm kinh nghiệm",
        "icon": "rising_star.png",
        "xp_reward": 0,
        "coin_reward": 20,
        "item_reward": None,
        "category": "general"
    },
    {
        "name": "Người giàu có",
        "description": "Tích lũy 500 xu",
        "icon": "rich.png",
        "xp_reward": 50,
        "coin_reward": 0,
        "item_reward": None,
        "category": "general"
    },
    {
        "name": "Triệu phú",
        "description": "Tích lũy 1,000 xu",
        "icon": "millionaire.png",
        "xp_reward": 100,
        "coin_reward": 0,
        "item_reward": "Rương tiền vàng",
        "category": "general"
    },
    {
        "name": "Người tiêu dùng",
        "description": "Mua 5 vật phẩm từ cửa hàng",
        "icon": "shopper.png",
        "xp_reward": 30,
        "coin_reward": 15,
        "item_reward": None,
        "category": "general"
    },
    {
        "name": "Nhà sưu tầm",
        "description": "Sở hữu 10 vật phẩm khác nhau",
        "icon": "collector.png",
        "xp_reward": 50,
        "coin_reward": 25,
        "item_reward": None,
        "category": "general"
    },
    {
        "name": "Lên cấp đầu tiên",
        "description": "Đạt cấp bậc Beginner lần đầu tiên",
        "icon": "first_levelup.png",
        "xp_reward": 0,
        "coin_reward": 30,
        "item_reward": None,
        "category": "general"
    },
    {
        "name": "Bậc thầy",
        "description": "Đạt cấp bậc Master",
        "icon": "master_rank.png",
        "xp_reward": 0,
        "coin_reward": 100,
        "item_reward": "Huy hiệu Bậc thầy",
        "category": "general"
    },
    {
        "name": "Huyền thoại",
        "description": "Đạt cấp bậc Legendary",
        "icon": "legendary.png",
        "xp_reward": 0,
        "coin_reward": 200,
        "item_reward": "Áo choàng Huyền thoại",
        "category": "general"
    },
    {
        "name": "Bánh may mắn",
        "description": "Mở 10 bánh may mắn",
        "icon": "fortune_cookies.png",
        "xp_reward": 40,
        "coin_reward": 20,
        "item_reward": None,
        "category": "general"
    },
    {
        "name": "Người hạnh phúc",
        "description": "Hoàn thành tất cả nhiệm vụ hàng ngày trong 1 ngày",
        "icon": "happy_person.png",
        "xp_reward": 50,
        "coin_reward": 25,
        "item_reward": None,
        "category": "general"
    },

    # QUIZ ACHIEVEMENTS - 15 thành tựu học tập
    {
        "name": "Lần đầu làm quiz",
        "description": "Hoàn thành bài quiz đầu tiên",
        "icon": "first_quiz.png",
        "xp_reward": 15,
        "coin_reward": 5,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Học sinh chăm chỉ",
        "description": "Hoàn thành 10 bài quiz",
        "icon": "diligent_student.png",
        "xp_reward": 30,
        "coin_reward": 15,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Siêu sao học tập",
        "description": "Hoàn thành 50 bài quiz",
        "icon": "quiz_superstar.png",
        "xp_reward": 100,
        "coin_reward": 50,
        "item_reward": "Cúp học tập",
        "category": "quiz"
    },
    {
        "name": "Người không biết mệt mỏi",
        "description": "Hoàn thành 100 bài quiz",
        "icon": "tireless.png",
        "xp_reward": 200,
        "coin_reward": 100,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Bắt đầu dễ dàng",
        "description": "Hoàn thành 10 câu hỏi dễ",
        "icon": "easy_start.png",
        "xp_reward": 20,
        "coin_reward": 10,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Thách thức trung bình",
        "description": "Hoàn thành 10 câu hỏi trung bình",
        "icon": "medium_challenge.png",
        "xp_reward": 40,
        "coin_reward": 20,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Chuyên gia",
        "description": "Hoàn thành 10 câu hỏi khó",
        "icon": "expert.png",
        "xp_reward": 80,
        "coin_reward": 40,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Siêu trí tuệ",
        "description": "Trả lời đúng 5 câu hỏi khó liên tiếp",
        "icon": "super_brain.png",
        "xp_reward": 100,
        "coin_reward": 50,
        "item_reward": "Mũ học giả",
        "category": "quiz"
    },
    {
        "name": "Đúng giờ",
        "description": "Hoàn thành 1 bài quiz trong vòng 1 phút",
        "icon": "on_time.png",
        "xp_reward": 30,
        "coin_reward": 15,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Toán học cơ bản",
        "description": "Hoàn thành 10 câu hỏi toán",
        "icon": "basic_math.png",
        "xp_reward": 35,
        "coin_reward": 15,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Nhà vật lý",
        "description": "Hoàn thành 10 câu hỏi vật lý",
        "icon": "physicist.png",
        "xp_reward": 35,
        "coin_reward": 15,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Nhà hóa học",
        "description": "Hoàn thành 10 câu hỏi hóa học",
        "icon": "chemist.png",
        "xp_reward": 35,
        "coin_reward": 15,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Nhà sinh học",
        "description": "Hoàn thành 10 câu hỏi sinh học",
        "icon": "biologist.png",
        "xp_reward": 35,
        "coin_reward": 15,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Toàn diện",
        "description": "Hoàn thành ít nhất 1 câu hỏi ở mỗi môn học",
        "icon": "well_rounded.png",
        "xp_reward": 50,
        "coin_reward": 25,
        "item_reward": None,
        "category": "quiz"
    },
    {
        "name": "Hoàn hảo",
        "description": "Đạt điểm tuyệt đối trong 1 bài quiz",
        "icon": "perfect_score.png",
        "xp_reward": 100,
        "coin_reward": 50,
        "item_reward": "Huân chương Hoàn hảo",
        "category": "quiz"
    },

    # CONTRIBUTION ACHIEVEMENTS - 10 thành tựu đóng góp
    {
        "name": "Đóng góp đầu tiên",
        "description": "Đóng góp câu hỏi đầu tiên",
        "icon": "first_contribution.png",
        "xp_reward": 30,
        "coin_reward": 15,
        "item_reward": None,
        "category": "contribution"
    },
    {
        "name": "Người sáng tạo",
        "description": "Đóng góp 5 câu hỏi được chấp nhận",
        "icon": "creator.png",
        "xp_reward": 75,
        "coin_reward": 35,
        "item_reward": None,
        "category": "contribution"
    },
    {
        "name": "Cống hiến",
        "description": "Đóng góp 15 câu hỏi được chấp nhận",
        "icon": "dedicated.png",
        "xp_reward": 150,
        "coin_reward": 75,
        "item_reward": "Bút cống hiến",
        "category": "contribution"
    },
    {
        "name": "Đóng góp viên vàng",
        "description": "Đóng góp 30 câu hỏi được chấp nhận",
        "icon": "golden_contributor.png",
        "xp_reward": 300,
        "coin_reward": 150,
        "item_reward": "Huy hiệu đóng góp vàng",
        "category": "contribution"
    },
    {
        "name": "Đóng góp viên bạch kim",
        "description": "Đóng góp 50 câu hỏi được chấp nhận",
        "icon": "platinum_contributor.png",
        "xp_reward": 500,
        "coin_reward": 250,
        "item_reward": "Huy hiệu đóng góp bạch kim",
        "category": "contribution"
    },
    {
        "name": "Nhà toán học",
        "description": "Đóng góp 10 câu hỏi toán học được chấp nhận",
        "icon": "mathematician.png",
        "xp_reward": 100,
        "coin_reward": 50,
        "item_reward": None,
        "category": "contribution"
    },
    {
        "name": "Nhà khoa học tự nhiên",
        "description": "Đóng góp 10 câu hỏi khoa học tự nhiên được chấp nhận",
        "icon": "natural_scientist.png",
        "xp_reward": 100,
        "coin_reward": 50,
        "item_reward": None,
        "category": "contribution"
    },
    {
        "name": "Nhà văn hóa xã hội",
        "description": "Đóng góp 10 câu hỏi về xã hội và văn hóa được chấp nhận",
        "icon": "social_scientist.png",
        "xp_reward": 100,
        "coin_reward": 50,
        "item_reward": None,
        "category": "contribution"
    },
    {
        "name": "Người giúp đỡ",
        "description": "Đóng góp 5 câu hỏi có phần giải thích chi tiết",
        "icon": "helper.png",
        "xp_reward": 80,
        "coin_reward": 40,
        "item_reward": None,
        "category": "contribution"
    },
    {
        "name": "Nhà giáo dục",
        "description": "Đóng góp câu hỏi ở tất cả các cấp độ khó",
        "icon": "educator.png",
        "xp_reward": 120,
        "coin_reward": 60,
        "item_reward": "Bằng khen Nhà giáo dục",
        "category": "contribution"
    },

    # SPECIAL ACHIEVEMENTS - 10 thành tựu đặc biệt
    {
        "name": "Kỷ lục gia",
        "description": "Đạt điểm số cao nhất trong một bài quiz",
        "icon": "record_breaker.png",
        "xp_reward": 150,
        "coin_reward": 75,
        "item_reward": "Cúp Kỷ lục",
        "category": "special"
    },
    {
        "name": "Chiến thắng sự kiện",
        "description": "Giành chiến thắng trong một sự kiện",
        "icon": "event_winner.png",
        "xp_reward": 200,
        "coin_reward": 100,
        "item_reward": "Huy hiệu sự kiện",
        "category": "special"
    },
    {
        "name": "Liên tục 7 ngày",
        "description": "Đăng nhập và hoàn thành ít nhất 1 bài quiz mỗi ngày trong 7 ngày liên tiếp",
        "icon": "seven_day_streak.png",
        "xp_reward": 70,
        "coin_reward": 35,
        "item_reward": None,
        "category": "special"
    },
    {
        "name": "Liên tục 30 ngày",
        "description": "Đăng nhập và hoàn thành ít nhất 1 bài quiz mỗi ngày trong 30 ngày liên tiếp",
        "icon": "thirty_day_streak.png",
        "xp_reward": 300,
        "coin_reward": 150,
        "item_reward": "Huy hiệu Kiên trì",
        "category": "special"
    },
    {
        "name": "Nhanh như chớp",
        "description": "Hoàn thành 5 bài quiz dưới 30 giây mỗi bài",
        "icon": "lightning_fast.png",
        "xp_reward": 100,
        "coin_reward": 50,
        "item_reward": None,
        "category": "special"
    },
    {
        "name": "Người bạn thân thiết",
        "description": "Mời 5 người bạn tham gia ứng dụng",
        "icon": "friendly.png",
        "xp_reward": 100,
        "coin_reward": 50,
        "item_reward": None,
        "category": "special"
    },
    {
        "name": "Người nổi tiếng",
        "description": "Mời 20 người bạn tham gia ứng dụng",
        "icon": "famous.png",
        "xp_reward": 250,
        "coin_reward": 125,
        "item_reward": "Kính râm người nổi tiếng",
        "category": "special"
    },
    {
        "name": "Thủ lĩnh",
        "description": "Dẫn đầu bảng xếp hạng trong 1 tuần",
        "icon": "leader.png",
        "xp_reward": 200,
        "coin_reward": 100,
        "item_reward": "Vương miện Thủ lĩnh",
        "category": "special"
    },
    {
        "name": "Bước ngoặt",
        "description": "Đạt mốc 500 kinh nghiệm",
        "icon": "milestone.png",
        "xp_reward": 0,
        "coin_reward": 100,
        "item_reward": None,
        "category": "special"
    },
    {
        "name": "Người tiên phong",
        "description": "Là một trong 100 người đầu tiên đăng ký tài khoản",
        "icon": "pioneer.png",
        "xp_reward": 100,
        "coin_reward": 50,
        "item_reward": "Huy hiệu Tiên phong",
        "category": "special"
    }
]

def get_achievements_by_category():
    """Return achievements organized by category"""
    categorized = {
        'general': [],
        'quiz': [],
        'contribution': [],
        'special': []
    }
    
    for achievement in ACHIEVEMENTS:
        category = achievement.get('category', 'general')
        if category in categorized:
            categorized[category].append(achievement)
    
    return categorized
