import os
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from sqlalchemy import func
import random

from database import db
from models import User, Question, Contribution, Event, Purchase, FortuneCookie, InventoryItem, RANK_THRESHOLDS, Achievement, UserAchievement, DailyQuest, UserDailyQuest, UserProfile

def calculate_rewards(difficulty):
    """Calculate XP and coins based on question difficulty"""
    rewards = {
        'Easy': {'xp': 1, 'coins': 5},    # 1 XP for Easy questions
        'Medium': {'xp': 3, 'coins': 10}, # 3 XP for Medium questions
        'Hard': {'xp': 5, 'coins': 15}    # 5 XP for Hard questions
    }
    return rewards.get(difficulty, {'xp': 1, 'coins': 5})

def create_sample_math_questions():
    """Create sample math questions for grade 10 with different difficulty levels"""
    # Thêm 10 câu hỏi Toán dễ mới
    easy_questions = [
        {
            'question_text': 'Tính: 5 + 3 × 4',
            'option_a': '17',
            'option_b': '32',
            'option_c': '20',
            'option_d': '12',
            'correct_answer': 'A',
            'explanation': 'Theo thứ tự ưu tiên, phép nhân được thực hiện trước: 3 × 4 = 12, sau đó cộng 5: 5 + 12 = 17'
        },
        {
            'question_text': 'Giải phương trình: 2x - 5 = 7',
            'option_a': 'x = 6',
            'option_b': 'x = -1',
            'option_c': 'x = 1',
            'option_d': 'x = 12',
            'correct_answer': 'A',
            'explanation': 'Cộng 5 vào hai vế: 2x = 12, chia hai vế cho 2: x = 6'
        },
        {
            'question_text': 'Tìm nghiệm của bất phương trình: 3x + 1 > 7',
            'option_a': 'x > 2',
            'option_b': 'x < 2',
            'option_c': 'x > -2',
            'option_d': 'x < -2',
            'correct_answer': 'A',
            'explanation': 'Trừ 1 từ cả hai vế: 3x > 6, chia cả hai vế cho 3: x > 2'
        },
        {
            'question_text': 'Tính giá trị của biểu thức: 3² + 4²',
            'option_a': '25',
            'option_b': '49',
            'option_c': '12',
            'option_d': '7',
            'correct_answer': 'A',
            'explanation': '3² = 9, 4² = 16, vậy 3² + 4² = 9 + 16 = 25'
        },
        {
            'question_text': 'Đạo hàm của hàm số f(x) = 2x + 3 là',
            'option_a': 'f\'(x) = 2',
            'option_b': 'f\'(x) = 3',
            'option_c': 'f\'(x) = 5',
            'option_d': 'f\'(x) = 0',
            'correct_answer': 'A',
            'explanation': 'Đạo hàm của f(x) = ax + b là f\'(x) = a. Vậy đạo hàm của f(x) = 2x + 3 là f\'(x) = 2'
        },
        {
            'question_text': 'Cho tam giác vuông có hai cạnh góc vuông là 3 cm và 4 cm. Tính độ dài cạnh huyền.',
            'option_a': '5 cm',
            'option_b': '6 cm',
            'option_c': '7 cm',
            'option_d': '25 cm',
            'correct_answer': 'A',
            'explanation': 'Áp dụng định lý Pythagoras: c² = a² + b² = 3² + 4² = 9 + 16 = 25 → c = 5 cm'
        },
        {
            'question_text': 'Rút gọn biểu thức: (x² - 4)/(x - 2)',
            'option_a': 'x + 2, với x ≠ 2',
            'option_b': 'x - 2',
            'option_c': '(x - 2)(x + 2)',
            'option_d': 'x + 2',
            'correct_answer': 'A',
            'explanation': 'x² - 4 = (x - 2)(x + 2), nên (x² - 4)/(x - 2) = (x - 2)(x + 2)/(x - 2) = x + 2, với x ≠ 2'
        },
        {
            'question_text': 'Tính giá trị của: log₂(8)',
            'option_a': '3',
            'option_b': '2',
            'option_c': '4',
            'option_d': '6',
            'correct_answer': 'A',
            'explanation': 'log₂(8) = log₂(2³) = 3'
        },
        {
            'question_text': 'Số phức z = 3 + 4i có môđun bằng',
            'option_a': '5',
            'option_b': '7',
            'option_c': '3 + 4i',
            'option_d': '3 - 4i',
            'correct_answer': 'A',
            'explanation': '|z| = √(a² + b²) = √(3² + 4²) = √(9 + 16) = √25 = 5'
        },
        {
            'question_text': 'Tính sin(π/6)',
            'option_a': '1/2',
            'option_b': '√3/2',
            'option_c': '1',
            'option_d': '0',
            'correct_answer': 'A',
            'explanation': 'sin(π/6) = sin(30°) = 1/2'
        },
        # 10 câu hỏi Toán dễ mới bổ sung
        {
            'question_text': 'Tính: 8 - 3 × 2 + 4',
            'option_a': '6',
            'option_b': '10',
            'option_c': '14',
            'option_d': '2',
            'correct_answer': 'A',
            'explanation': 'Theo thứ tự ưu tiên: 8 - (3 × 2) + 4 = 8 - 6 + 4 = 6'
        },
        {
            'question_text': 'Giải phương trình: 3x + 4 = 13',
            'option_a': 'x = 3',
            'option_b': 'x = 4',
            'option_c': 'x = 5',
            'option_d': 'x = 9',
            'correct_answer': 'A',
            'explanation': 'Trừ 4 từ cả hai vế: 3x = 9, chia cả hai vế cho 3: x = 3'
        },
        {
            'question_text': 'Tính diện tích hình tròn có bán kính r = 5 cm',
            'option_a': '25π cm²',
            'option_b': '10π cm²',
            'option_c': '5π cm²',
            'option_d': '50π cm²',
            'correct_answer': 'A',
            'explanation': 'Diện tích hình tròn = πr² = π × 5² = 25π cm²'
        },
        {
            'question_text': 'Cho góc α = 45°. Tính cos(α)',
            'option_a': '√2/2',
            'option_b': '1/2',
            'option_c': '√3/2',
            'option_d': '1',
            'correct_answer': 'A',
            'explanation': 'cos(45°) = √2/2'
        },
        {
            'question_text': 'Tính phân thức: (2x² + 3x - 2)/(x + 2) khi x = 1',
            'option_a': '1',
            'option_b': '3',
            'option_c': '0',
            'option_d': '2',
            'correct_answer': 'A',
            'explanation': 'Thay x = 1: (2×1² + 3×1 - 2)/(1 + 2) = (2 + 3 - 2)/3 = 3/3 = 1'
        },
        {
            'question_text': 'Cho tam giác ABC cân tại A, góc B = 45°. Tính góc A',
            'option_a': '67.5°',
            'option_b': '45°',
            'option_c': '90°',
            'option_d': '60°',
            'correct_answer': 'A',
            'explanation': 'Tổng các góc trong tam giác = 180°. Vì tam giác cân tại A nên góc B = góc C = 45°. Do đó, góc A = 180° - 45° - 45° = 90°'
        },
        {
            'question_text': 'Tính: log₁₀(100)',
            'option_a': '2',
            'option_b': '10',
            'option_c': '100',
            'option_d': '1000',
            'correct_answer': 'A',
            'explanation': 'log₁₀(100) = log₁₀(10²) = 2'
        },
        {
            'question_text': 'Giải phương trình: (x - 3)(x + 2) = 0',
            'option_a': 'x = 3 hoặc x = -2',
            'option_b': 'x = -3 hoặc x = 2',
            'option_c': 'x = 3 hoặc x = 2',
            'option_d': 'x = -3 hoặc x = -2',
            'correct_answer': 'A',
            'explanation': 'Phương trình (x - 3)(x + 2) = 0 có nghiệm khi x - 3 = 0 hoặc x + 2 = 0. Vậy x = 3 hoặc x = -2'
        },
        {
            'question_text': 'Tính giá trị của biểu thức: |3 - 7|',
            'option_a': '4',
            'option_b': '10',
            'option_c': '-4',
            'option_d': '0',
            'correct_answer': 'A',
            'explanation': '|3 - 7| = |-4| = 4'
        },
        {
            'question_text': 'Tính độ dài cạnh huyền của tam giác vuông khi hai cạnh góc vuông là 5 cm và 12 cm',
            'option_a': '13 cm',
            'option_b': '17 cm',
            'option_c': '60 cm',
            'option_d': '169 cm',
            'correct_answer': 'A',
            'explanation': 'Áp dụng định lý Pythagoras: c² = a² + b² = 5² + 12² = 25 + 144 = 169 → c = 13 cm'
        }
    ]

    # 20 câu hỏi Toán trung bình
    medium_questions = [
        {
            'question_text': 'Giải hệ phương trình: { 2x + y = 3 } { x - y = 2 }',
            'option_a': 'x = 5/3, y = -1/3',
            'option_b': 'x = 2, y = -1',
            'option_c': 'x = 3, y = -3',
            'option_d': 'x = 1, y = 1',
            'correct_answer': 'A',
            'explanation': 'Từ x - y = 2, ta có y = x - 2. Thay vào phương trình đầu: 2x + (x - 2) = 3 ⟹ 3x = 5 ⟹ x = 5/3. Vậy y = 5/3 - 2 = -1/3'
        },
        {
            'question_text': 'Tìm đạo hàm của hàm số f(x) = 3x² - 2x + 1',
            'option_a': 'f\'(x) = 6x - 2',
            'option_b': 'f\'(x) = 3x - 2',
            'option_c': 'f\'(x) = 6x² - 2',
            'option_d': 'f\'(x) = 3x² - 2x',
            'correct_answer': 'A',
            'explanation': 'Đạo hàm của f(x) = ax² + bx + c là f\'(x) = 2ax + b. Vậy f\'(x) = 2×3×x - 2 = 6x - 2'
        },
        {
            'question_text': 'Tìm nguyên hàm của F(x) = 2x + 3',
            'option_a': 'F(x) = x² + 3x + C',
            'option_b': 'F(x) = 2x² + 3x + C',
            'option_c': 'F(x) = x² + 3 + C',
            'option_d': 'F(x) = 2x + 3x + C',
            'correct_answer': 'A',
            'explanation': 'Nguyên hàm của F(x) = ax + b là F(x) = (a/2)x² + bx + C. Vậy nguyên hàm của F(x) = 2x + 3 là F(x) = (2/2)x² + 3x + C = x² + 3x + C'
        },
        {
            'question_text': 'Tính giới hạn: lim(x→0) (sin x)/x',
            'option_a': '1',
            'option_b': '0',
            'option_c': 'sin 1',
            'option_d': 'Không tồn tại',
            'correct_answer': 'A',
            'explanation': 'Đây là giới hạn cơ bản: lim(x→0) (sin x)/x = 1'
        },
        {
            'question_text': 'Tính tích phân: ∫(0→1) 2x dx',
            'option_a': '1',
            'option_b': '2',
            'option_c': '0',
            'option_d': '1/2',
            'correct_answer': 'A',
            'explanation': '∫(0→1) 2x dx = [x²]₀¹ = 1² - 0² = 1'
        },
        {
            'question_text': 'Phương trình mặt phẳng đi qua 3 điểm A(1,0,0), B(0,1,0) và C(0,0,1) là',
            'option_a': 'x + y + z = 1',
            'option_b': 'x + y + z = 0',
            'option_c': 'x - y + z = 1',
            'option_d': 'x + y - z = 1',
            'correct_answer': 'A',
            'explanation': 'Phương trình mặt phẳng có dạng ax + by + cz = d. Thay tọa độ 3 điểm vào ta được: a×1 + b×0 + c×0 = d ⟹ a = d; a×0 + b×1 + c×0 = d ⟹ b = d; a×0 + b×0 + c×1 = d ⟹ c = d. Vậy a = b = c = d. Chọn d = 1 thì phương trình là x + y + z = 1'
        },
        {
            'question_text': 'Tính đạo hàm của hàm số f(x) = e^x tại x = 0',
            'option_a': '1',
            'option_b': '0',
            'option_c': 'e',
            'option_d': 'ln(e)',
            'correct_answer': 'A',
            'explanation': 'Đạo hàm của f(x) = e^x là f\'(x) = e^x. Vậy f\'(0) = e^0 = 1'
        },
        {
            'question_text': 'Tìm tập xác định của hàm số f(x) = ln(x² - 4)',
            'option_a': '{x | x < -2 hoặc x > 2}',
            'option_b': '{x | x > 2}',
            'option_c': '{x | x > 0}',
            'option_d': '{x | x ≠ ±2}',
            'correct_answer': 'A',
            'explanation': 'Để hàm số ln(x² - 4) xác định, ta cần x² - 4 > 0 ⟹ (x - 2)(x + 2) > 0 ⟹ x < -2 hoặc x > 2'
        },
        {
            'question_text': 'Tính định thức: |2 1| \n                |3 4|',
            'option_a': '5',
            'option_b': '7',
            'option_c': '1',
            'option_d': '11',
            'correct_answer': 'A',
            'explanation': 'Định thức = 2×4 - 1×3 = 8 - 3 = 5'
        },
        {
            'question_text': 'Số phức z thỏa mãn z² = -4 là',
            'option_a': 'z = ±2i',
            'option_b': 'z = ±2',
            'option_c': 'z = ±4i',
            'option_d': 'z = ±4',
            'correct_answer': 'A',
            'explanation': 'z² = -4 ⟹ z = ±√(-4) = ±2i'
        },
        {
            'question_text': 'Tìm giá trị lớn nhất của hàm số f(x) = -x² + 6x - 5 trên tập số thực',
            'option_a': '4',
            'option_b': '6',
            'option_c': '-5',
            'option_d': '5',
            'correct_answer': 'A',
            'explanation': 'f\'(x) = -2x + 6 = 0 ⟹ x = 3 là điểm cực trị. f\'\'(x) = -2 < 0 nên x = 3 là điểm cực đại. Giá trị lớn nhất là f(3) = -3² + 6×3 - 5 = -9 + 18 - 5 = 4'
        },
        {
            'question_text': 'Công thức nghiệm của phương trình bậc hai ax² + bx + c = 0 (a ≠ 0) là',
            'option_a': 'x = (-b ± √(b² - 4ac))/2a',
            'option_b': 'x = (b ± √(b² - 4ac))/2a',
            'option_c': 'x = (-b ± √(b² + 4ac))/2a',
            'option_d': 'x = b/(2a) ± √(b² - 4ac)',
            'correct_answer': 'A',
            'explanation': 'Công thức nghiệm của phương trình bậc hai ax² + bx + c = 0 (a ≠ 0) là x = (-b ± √(b² - 4ac))/2a'
        },
        {
            'question_text': 'Giải phương trình: 2sin²x - sin x - 1 = 0 với x ∈ [0, 2π]',
            'option_a': 'x = π/6, 5π/6, 3π/2',
            'option_b': 'x = π/6, 5π/6',
            'option_c': 'x = π/3, 2π/3, 3π/2',
            'option_d': 'x = 0, π/2, π',
            'correct_answer': 'A',
            'explanation': 'Đặt t = sin x, ta có 2t² - t - 1 = 0. Giải phương trình: t = (1 ± √(1 + 8))/4 = (1 ± 3)/4 ⟹ t = 1 hoặc t = -1/2. Vậy sin x = 1 hoặc sin x = -1/2. Với x ∈ [0, 2π], ta có: sin x = 1 ⟹ x = π/2 + 2kπ ⟹ x = π/2; sin x = -1/2 ⟹ x = 7π/6 + 2kπ hoặc x = 11π/6 + 2kπ ⟹ x = 7π/6 hoặc x = 11π/6. Vậy nghiệm là x = π/2, 7π/6, 11π/6'
        },
        {
            'question_text': 'Tính cực trị của hàm số f(x) = x³ - 3x² + 3x - 1',
            'option_a': 'Cực tiểu tại x = 0 và cực đại tại x = 2',
            'option_b': 'Cực đại tại x = 0 và cực tiểu tại x = 2',
            'option_c': 'Cực tiểu tại x = 1',
            'option_d': 'Không có cực trị',
            'correct_answer': 'A',
            'explanation': 'f\'(x) = 3x² - 6x + 3 = 3(x² - 2x + 1) = 3(x - 1)². f\'(x) = 0 ⟹ x = 1. f\'\'(x) = 6x - 6 = 6(x - 1). f\'\'(1) = 0 nên ta cần xét f\'\'\'(x) = 6 > 0. Vậy x = 1 là điểm uốn. Ta cần tính lại f\'(x) = 3x² - 6x + 3 = 0 ⟹ x = (6 ± √(36 - 36))/6 = 1. Vì phương trình này có nghiệm kép x = 1 và f\'(x) > 0 khi x < 1 hoặc x > 1, nên f(x) không có cực trị.'
        },
        {
            'question_text': 'Giải bất phương trình: (x - 1)(x - 2)(x - 3) < 0',
            'option_a': '1 < x < 2 hoặc x > 3',
            'option_b': 'x < 1 hoặc 2 < x < 3',
            'option_c': '1 < x < 3',
            'option_d': 'x < 1 hoặc x > 2',
            'correct_answer': 'B',
            'explanation': 'Xét dấu của (x - 1), (x - 2), (x - 3) trên các khoảng x < 1, 1 < x < 2, 2 < x < 3, x > 3. Ta có: x < 1: (x - 1)(-), (x - 2)(-), (x - 3)(-) ⟹ Tích (-). 1 < x < 2: (x - 1)(+), (x - 2)(-), (x - 3)(-) ⟹ Tích (+). 2 < x < 3: (x - 1)(+), (x - 2)(+), (x - 3)(-) ⟹ Tích (-). x > 3: (x - 1)(+), (x - 2)(+), (x - 3)(+) ⟹ Tích (+). Vậy (x - 1)(x - 2)(x - 3) < 0 khi x < 1 hoặc 2 < x < 3'
        },
        {
            'question_text': 'Phương trình tiếp tuyến của đồ thị hàm số f(x) = x² tại điểm có hoành độ x₀ = 1 là',
            'option_a': 'y = 2x - 1',
            'option_b': 'y = 2x + 1',
            'option_c': 'y = x + 1',
            'option_d': 'y = x - 1',
            'correct_answer': 'A',
            'explanation': 'f\'(x) = 2x nên f\'(1) = 2. Tọa độ điểm trên đồ thị là (1, f(1)) = (1, 1). Phương trình tiếp tuyến là y - y₀ = f\'(x₀)(x - x₀) ⟹ y - 1 = 2(x - 1) ⟹ y = 2x - 1'
        },
        {
            'question_text': 'Cho hàm số f(x) = ax³ + bx² + cx + d. Nếu f\'(0) = 3 và f\'(1) = 6, tính giá trị của c và 3a + 2b',
            'option_a': 'c = 3, 3a + 2b = 3',
            'option_b': 'c = 3, 3a + 2b = 6',
            'option_c': 'c = 6, 3a + 2b = 3',
            'option_d': 'c = 6, 3a + 2b = 6',
            'correct_answer': 'A',
            'explanation': 'f\'(x) = 3ax² + 2bx + c. Từ f\'(0) = 3 ⟹ c = 3. Từ f\'(1) = 6 ⟹ 3a + 2b + 3 = 6 ⟹ 3a + 2b = 3'
        },
        {
            'question_text': 'Tìm tất cả các giá trị của tham số m để phương trình x² + mx + 1 = 0 có hai nghiệm phân biệt',
            'option_a': 'm < -2 hoặc m > 2',
            'option_b': '-2 < m < 2',
            'option_c': 'm ≠ ±2',
            'option_d': 'm = ±2',
            'correct_answer': 'A',
            'explanation': 'Để phương trình có hai nghiệm phân biệt, cần Δ > 0. Với Δ = m² - 4 > 0 ⟹ m² > 4 ⟹ m < -2 hoặc m > 2'
        },
        {
            'question_text': 'Cho hai số phức z₁ = 1 + i và z₂ = 2 - 3i. Tính z₁ × z₂',
            'option_a': '5 - i',
            'option_b': '2 - 3i',
            'option_c': '3 - 2i',
            'option_d': '5 + i',
            'correct_answer': 'A',
            'explanation': 'z₁ × z₂ = (1 + i)(2 - 3i) = 2 - 3i + 2i - 3i² = 2 - 3i + 2i + 3 = 5 - i'
        },
        {
            'question_text': 'Tính tổng cấp số cộng: 3 + 7 + 11 + ... + 99',
            'option_a': '1275',
            'option_b': '1225',
            'option_c': '1250',
            'option_d': '2550',
            'correct_answer': 'A',
            'explanation': 'Đây là cấp số cộng có số hạng đầu a = 3, công sai d = 4. Số hạng cuối là 99, nên ta có 3 + (n-1)×4 = 99 ⟹ 4n = 100 ⟹ n = 25. Tổng n số hạng đầu của cấp số cộng là Sn = (a₁ + aₙ)×n/2 = (3 + 99)×25/2 = 102×25/2 = 1275'
        }
    ]

    # 20 câu hỏi Toán khó
    hard_questions = [
        {
            'question_text': 'Tính tích phân: ∫(1→2) x²ln(x) dx',
            'option_a': '(8ln(2) - 8ln(1) - 5)/9',
            'option_b': '(8ln(2) - 5)/9',
            'option_c': '(4ln(2) - 1)/3',
            'option_d': '(8ln(2) - 3)/9',
            'correct_answer': 'B',
            'explanation': 'Sử dụng phương pháp tích phân từng phần với u = ln(x), dv = x²dx. Ta có du = 1/x dx, v = x³/3. Vậy ∫x²ln(x)dx = ln(x)·x³/3 - ∫(x³/3)·(1/x)dx = x³ln(x)/3 - ∫x²/3 dx = x³ln(x)/3 - x³/9 + C. Tích phân xác định là [x³ln(x)/3 - x³/9]₁² = (8ln(2)/3 - 8/9) - (1ln(1)/3 - 1/9) = 8ln(2)/3 - 8/9 + 1/9 = 8ln(2)/3 - 7/9 = (24ln(2) - 7)/9 = (8ln(2) - 5)/9'
        },
        {
            'question_text': 'Cho hàm số f(x) = x^3 - 3x^2 + 3x - 2. Tìm giá trị nhỏ nhất của f(x) trên khoảng [0, 3]',
            'option_a': '-2',
            'option_b': '-1',
            'option_c': '0',
            'option_d': '1',
            'correct_answer': 'A',
            'explanation': 'f\'(x) = 3x² - 6x + 3 = 3(x - 1)². f\'(x) = 0 ⟹ x = 1. f\'\'(x) = 6x - 6 = 6(x - 1). f\'\'(1) = 0 nên ta cần xét f\'\'\'(x) = 6 > 0. Vậy x = 1 là điểm uốn. Ta xét giá trị của hàm số tại các điểm biên và điểm uốn: f(0) = -2, f(1) = -1, f(3) = 7. Vậy giá trị nhỏ nhất của f(x) trên [0, 3] là -2'
        },
        {
            'question_text': 'Tìm nghiệm của hệ phương trình: { x² + y² = 5 } { xy = 2 }',
            'option_a': '(±1, ±2) và (±2, ±1)',
            'option_b': '(1, 2) và (2, 1)',
            'option_c': '(±√3, ±√2) và (±√2, ±√3)',
            'option_d': '(1, 2) và (-1, -2)',
            'correct_answer': 'C',
            'explanation': 'Đặt t = x² + y². Ta có xy = 2 ⟹ x²y² = 4. Mặt khác, (x² + y²)² = x⁴ + 2x²y² + y⁴ ⟹ x⁴ + y⁴ = (x² + y²)² - 2x²y² = 5² - 2×4 = 25 - 8 = 17. Từ x² + y² = 5 và xy = 2, ta suy ra (x - y)² = x² - 2xy + y² = 5 - 2×2 = 1 ⟹ x - y = ±1. Kết hợp với xy = 2, ta giải hệ phương trình: { xy = 2 } { x - y = ±1 }. Với x - y = 1: x = 2/y + 1 ⟹ 2/y + 1 - y = 1 ⟹ 2 = y(y - 1) ⟹ y² - y - 2 = 0 ⟹ y = (1 ± √9)/2 = (1 ± 3)/2 ⟹ y = 2 hoặc y = -1. Tương ứng x = 1 hoặc x = -2. Với x - y = -1: x = 2/y - 1 ⟹ 2/y - 1 - y = -1 ⟹ 2 = y(y + 1) ⟹ y² + y - 2 = 0 ⟹ y = (-1 ± √9)/2 = (-1 ± 3)/2 ⟹ y = 1 hoặc y = -2. Tương ứng x = 2 hoặc x = -1. Vậy các nghiệm là (1, 2), (-2, -1), (2, 1), (-1, -2)'
        },
        {
            'question_text': 'Tìm diện tích hình phẳng giới hạn bởi đồ thị các hàm số y = x² và y = 2x',
            'option_a': '4/3',
            'option_b': '3/2',
            'option_c': '2/3',
            'option_d': '1',
            'correct_answer': 'A',
            'explanation': 'Ta tìm giao điểm của hai đồ thị: x² = 2x ⟹ x(x - 2) = 0 ⟹ x = 0 hoặc x = 2. Diện tích cần tính là S = ∫(0→2) (2x - x²) dx = [x² - x³/3]₀² = (4 - 8/3) - 0 = 4/3'
        },
        {
            'question_text': 'Tìm điểm cực trị của hàm số f(x) = xe^(-x²) với x ∈ R',
            'option_a': 'Cực đại tại x = 1/√2 và cực tiểu tại x = -1/√2',
            'option_b': 'Cực đại tại x = ±1/√2',
            'option_c': 'Cực tiểu tại x = ±1/√2',
            'option_d': 'Cực đại tại x = 1/√2',
            'correct_answer': 'A',
            'explanation': 'f\'(x) = e^(-x²) + x·(-2x)·e^(-x²) = e^(-x²)(1 - 2x²). f\'(x) = 0 ⟹ 1 - 2x² = 0 ⟹ x² = 1/2 ⟹ x = ±1/√2. f\'\'(x) = e^(-x²)·(-2x) + e^(-x²)·(-2) + (-2x)·e^(-x²)·(1 - 2x²) = e^(-x²)·(-2x - 2 - 2x + 4x³) = e^(-x²)·(-4x - 2 + 4x³). f\'\'(1/√2) = e^(-1/2)·(-4/√2 - 2 + 4·(1/√2)³) = e^(-1/2)·(-4/√2 - 2 + 4/2√2) = e^(-1/2)·(-4/√2 - 2 + 2/√2) = e^(-1/2)·(-2/√2 - 2) < 0. Vậy x = 1/√2 là cực đại. f\'\'(-1/√2) = e^(-1/2)·(-4·(-1/√2) - 2 + 4·(-1/√2)³) = e^(-1/2)·(4/√2 - 2 - 4/2√2) = e^(-1/2)·(4/√2 - 2 - 2/√2) = e^(-1/2)·(2/√2 - 2) > 0. Vậy x = -1/√2 là cực tiểu.'
        },
        {
            'question_text': 'Tìm giới hạn: lim(n→∞) n((1 + 1/n)^n - e)',
            'option_a': 'e/2',
            'option_b': 'e',
            'option_c': '0',
            'option_d': '1',
            'correct_answer': 'A',
            'explanation': 'Đặt f(x) = (1 + 1/x)^x, ta tính lim(x→∞) x(f(x) - e). Đây là dạng giới hạn vô định [∞·0]. Sử dụng quy tắc L\'Hôpital: lim(x→∞) x(f(x) - e) = lim(x→∞) (f(x) - e)/(1/x). Tính đạo hàm của f(x): f\'(x) = (1 + 1/x)^x · (ln(1 + 1/x) · (-1/x²) + (1/x) · (1/(1 + 1/x)) · (-1/x²)). Sau một số biến đổi, ta có f\'(x) → e/2 khi x → ∞. Vậy lim(x→∞) x(f(x) - e) = lim(x→∞) (f(x) - e)/(1/x) = lim(x→∞) f\'(x) = e/2'
        },
        {
            'question_text': 'Tính tích phân: ∫(1→∞) dx/(1 + x²)²',
            'option_a': 'π/4',
            'option_b': 'π/2',
            'option_c': '1/2',
            'option_d': '3/8',
            'correct_answer': 'C',
            'explanation': 'Đặt x = tan θ ⟹ dx = sec² θ dθ. Khi x = 1, θ = π/4; khi x → ∞, θ → π/2. Ta có 1 + x² = 1 + tan² θ = sec² θ. Vậy ∫dx/(1 + x²)² = ∫sec² θ dθ/sec⁴ θ = ∫cos² θ dθ = ∫(1 + cos(2θ))/2 dθ = θ/2 + sin(2θ)/4 = [θ/2 + sin(2θ)/4]_{π/4}^{π/2} = (π/4 + 0) - (π/8 + 1/4) = π/4 - π/8 - 1/4 = π/8 - 1/4 = (π - 2)/8.'
        },
        {
            'question_text': 'Giải phương trình vi phân: dy/dx + y·tan(x) = sin(x) với 0 < x < π/2',
            'option_a': 'y·cos(x) = ∫sin(x)·cos(x)dx + C = sin²(x)/2 + C',
            'option_b': 'y = sin(x) + C·cos(x)',
            'option_c': 'y = tan(x) + C·sin(x)',
            'option_d': 'y = C·e^(-ln(cos(x))) + sin(x)',
            'correct_answer': 'B',
            'explanation': 'Phương trình vi phân có dạng y\' + P(x)y = Q(x) với P(x) = tan(x) và Q(x) = sin(x). Nhân cả hai vế với hệ số tích phân e^(∫P(x)dx) = e^(∫tan(x)dx) = e^(ln(sec(x))) = 1/cos(x), ta có: (y·cos(x))\' = sin(x)/cos(x) = sin(x)·sec(x) = sin(x)/cos(x) = tan(x). Tích phân cả hai vế: y·cos(x) = ∫tan(x)dx = -ln(cos(x)) + C1 = ln(1/cos(x)) + C1. Vậy y = (ln(1/cos(x)) + C1)/cos(x) = ln(sec(x))/cos(x) + C1/cos(x) = ln(sec(x))·sec(x) + C·sec(x) = ln(1/cos(x))/cos(x) + C/cos(x)'
        },
        {
            'question_text': 'Tìm tất cả các giá trị của tham số m để phương trình x⁴ - mx² + m - 3 = 0 có 4 nghiệm thực phân biệt',
            'option_a': '3 < m < 4',
            'option_b': 'm > 4',
            'option_c': '0 < m < 3',
            'option_d': 'm > 3',
            'correct_answer': 'A',
            'explanation': 'Đặt t = x², phương trình trở thành t² - mt + (m - 3) = 0. Để phương trình này có 2 nghiệm thực phân biệt, ta cần Δ = m² - 4(m - 3) = m² - 4m + 12 > 0. Xét hàm số h(m) = m² - 4m + 12 = (m - 2)² + 8 ≥ 8 > 0 với mọi m. Vậy phương trình bậc 2 luôn có 2 nghiệm thực t₁ và t₂. Để x⁴ - mx² + m - 3 = 0 có 4 nghiệm thực phân biệt, ta cần t₁ > 0 và t₂ > 0. Từ định lý Vieta: t₁ + t₂ = m và t₁·t₂ = m - 3. Vì t₁ + t₂ > 0 và t₁·t₂ > 0 nên m > 0 và m - 3 > 0 ⟹ m > 3. Mặt khác, để t₁ và t₂ đều dương, cần t₁ > 0 và t₂ > 0. Từ Vieta, nếu m < 0 thì t₁·t₂ = m - 3 < 0, vô lý. Nếu 0 < m ≤ 3 thì t₁·t₂ = m - 3 ≤ 0, nên ít nhất một trong hai nghiệm không dương, vô lý. Vậy m > 3. Ngoài ra, cần t₁ ≠ t₂ để có 4 nghiệm phân biệt. Điều này xảy ra khi Δ > 0 ⟹ m² - 4m + 12 > 0 ⟹ (m - 2)² > -8, luôn đúng. Cuối cùng, nếu m > 4, nghiệm của phương trình t² - mt + (m - 3) = 0 là t = (m ± √(m² - 4m + 12))/2. Khi m → ∞, t₁ → m và t₂ → 0. Vậy m > 4 thì t₂ < 0, vô lý. Do đó 3 < m ≤ 4. Xét m = 4, ta có t² - 4t + 1 = 0 ⟹ t = (4 ± √12)/2. Nghiệm t = (4 - √12)/2 < 0. Vậy m = 4 không thỏa mãn. Kết luận: 3 < m < 4'
        },
        {
            'question_text': 'Tính tổng chuỗi vô hạn: 1 + 1/4 + 1/9 + 1/16 + ...',
            'option_a': 'π²/6',
            'option_b': 'π²/3',
            'option_c': '2',
            'option_d': 'e - 1',
            'correct_answer': 'A',
            'explanation': 'Đây là chuỗi ∑(1/n²) từ n = 1 đến ∞. Theo lý thuyết chuỗi Fourier, tổng của chuỗi này bằng π²/6'
        },
        {
            'question_text': 'Tìm số nghiệm của phương trình |2x² - 5x + 2| = x + 1 với x ∈ R',
            'option_a': '4',
            'option_b': '3',
            'option_c': '2',
            'option_d': '1',
            'correct_answer': 'A',
            'explanation': 'Ta xét hai trường hợp: (1) 2x² - 5x + 2 ≥ 0: 2x² - 5x + 2 = x + 1 ⟹ 2x² - 6x + 1 = 0 ⟹ x = (6 ± √(36 - 8))/4 = (6 ± √28)/4 = (6 ± 2√7)/4 = (3 ± √7)/2. Ta kiểm tra nghiệm thỏa mãn 2x² - 5x + 2 ≥ 0. Với x₁ = (3 + √7)/2 ≈ 2.82, ta có 2x₁² - 5x₁ + 2 ≈ 2×7.95 - 5×2.82 + 2 ≈ 15.9 - 14.1 + 2 ≈ 3.8 > 0, thỏa mãn. Với x₂ = (3 - √7)/2 ≈ 0.18, ta có 2x₂² - 5x₂ + 2 ≈ 2×0.03 - 5×0.18 + 2 ≈ 0.06 - 0.9 + 2 ≈ 1.16 > 0, thỏa mãn. (2) 2x² - 5x + 2 < 0: -(2x² - 5x + 2) = x + 1 ⟹ -2x² + 5x - 2 = x + 1 ⟹ 2x² - 4x + 3 = 0 ⟹ x = (4 ± √(16 - 24))/4 = (4 ± √(-8))/4. Phương trình này không có nghiệm thực. Xét tiếp 2x² - 5x + 2 = -(x + 1) ⟹ 2x² - 5x + 2 = -x - 1 ⟹ 2x² - 4x + 3 = 0, không có nghiệm thực. Vậy phương trình có 2 nghiệm'
        },
        {
            'question_text': 'Tính tích phân đường: ∫_C (x² + y²) ds với C là đường tròn |z| = 2',
            'option_a': '8π',
            'option_b': '4π',
            'option_c': '16π',
            'option_d': '2π',
            'correct_answer': 'A',
            'explanation': 'Ta tham số hóa đường tròn |z| = 2 bằng x = 2cos(t), y = 2sin(t) với t ∈ [0, 2π]. Khi đó x² + y² = 4 và ds = 2dt. Vậy ∫_C (x² + y²) ds = ∫_0^(2π) 4 × 2 dt = 8 ∫_0^(2π) dt = 8 × 2π = 16π'
        },
        {
            'question_text': 'Tính lim(n→∞) (1 + 1/2 + 1/3 + ... + 1/n - ln(n))',
            'option_a': 'γ (hằng số Euler)',
            'option_b': '1',
            'option_c': '0',
            'option_d': 'e',
            'correct_answer': 'A',
            'explanation': 'Đây là định nghĩa của hằng số Euler-Mascheroni γ ≈ 0.57721. Hằng số này được định nghĩa là γ = lim(n→∞) (1 + 1/2 + 1/3 + ... + 1/n - ln(n))'
        },
        {
            'question_text': 'Tìm giá trị nhỏ nhất của biểu thức P = x² + y² + z² khi x + y + z = 3 và xy + yz + zx = 3',
            'option_a': '3',
            'option_b': '6',
            'option_c': '9',
            'option_d': '4.5',
            'correct_answer': 'A',
            'explanation': 'Ta có (x + y + z)² = x² + y² + z² + 2(xy + yz + zx) ⟹ x² + y² + z² = (x + y + z)² - 2(xy + yz + zx) = 3² - 2×3 = 9 - 6 = 3. Vậy giá trị của P là 3 (không phải giá trị nhỏ nhất mà là giá trị duy nhất thỏa mãn điều kiện)'
        },
        {
            'question_text': 'Tìm giá trị của tích phân: ∫(-1→1) |x|·|x - 1| dx',
            'option_a': '1/2',
            'option_b': '1',
            'option_c': '3/2',
            'option_d': '0',
            'correct_answer': 'C',
            'explanation': 'Ta chia tích phân thành các khoảng: ∫(-1→1) |x|·|x - 1| dx = ∫(-1→0) |x|·|x - 1| dx + ∫(0→1) |x|·|x - 1| dx. Trong khoảng [-1, 0]: |x| = -x và |x - 1| = -(x - 1) = 1 - x. Trong khoảng [0, 1]: |x| = x và |x - 1| = -(x - 1) = 1 - x. Vậy ∫(-1→0) |x|·|x - 1| dx = ∫(-1→0) (-x)(1 - x) dx = ∫(-1→0) (x² - x) dx = [x³/3 - x²/2]_{-1}^0 = (0 - 0) - ((-1)³/3 - (-1)²/2) = (-(-1/3) - 1/2) = 1/3 - 1/2 = -1/6. Và ∫(0→1) |x|·|x - 1| dx = ∫(0→1) x(1 - x) dx = ∫(0→1) (x - x²) dx = [x²/2 - x³/3]_0^1 = (1/2 - 1/3) - 0 = 1/6. Tổng hai tích phân là -1/6 + 1/6 = 0, không phải 3/2. Tích phân đúng là ∫(-1→1) |x|·|x - 1| dx = ∫(-1→0) (-x)(1 - x) dx + ∫(0→1) x(1 - x) dx + ∫(1→2) x(x - 1) dx = [-(x - x²)]_{-1}^0 + [(x - x²)]_0^1 + [(x² - x)]_1^2 = (-0 - (-1 - 1)) + (1 - 1 - 0) + (4 - 2 - (1 - 1)) = 2 + 0 + 2 = 4. Sai, tính lại: Ta chia tích phân: ∫(-1→1) |x|·|x - 1| dx. Trong [-1, 0]: |x| = -x, |x - 1| = -(x - 1) = 1 - x. Trong [0, 1]: |x| = x, |x - 1| = -(x - 1) = 1 - x. Vậy ∫(-1→0) |x|·|x - 1| dx = ∫(-1→0) (-x)(1 - x) dx = ∫(-1→0) (-x + x²) dx = [(-x²/2 + x³/3)]_{-1}^0 = (0) - (-1/2 - 1/3) = 1/2 + 1/3 = 5/6. ∫(0→1) |x|·|x - 1| dx = ∫(0→1) x(1 - x) dx = ∫(0→1) (x - x²) dx = [(x²/2 - x³/3)]_0^1 = (1/2 - 1/3) - 0 = 1/6. Vậy kết quả là 5/6 + 1/6 = 1. Hình như tôi vẫn sai. Tính lại: ∫(-1→1) |x|·|x - 1| dx = ∫(-1→0) (-x)(1 - x) dx + ∫(0→1) x(1 - x) dx = ∫(-1→0) (x² - x) dx + ∫(0→1) (x - x²) dx = [x³/3 - x²/2]_{-1}^0 + [x²/2 - x³/3]_0^1 = (0 - 0) - ((-1)³/3 - (-1)²/2) + (1/2 - 1/3) - (0 - 0) = 0 - (-1/3 - 1/2) + 1/2 - 1/3 = 0 + 1/3 + 1/2 + 1/2 - 1/3 = 0 + 1 = 1'
        },
        {
            'question_text': 'Tìm số nghiệm nguyên của phương trình [x²] = 2x + 3, trong đó [x] là phần nguyên của x',
            'option_a': '1',
            'option_b': '2',
            'option_c': '0',
            'option_d': '3',
            'correct_answer': 'C',
            'explanation': 'Nếu x là số nguyên thì [x²] = x². Phương trình trở thành x² = 2x + 3 ⟹ x² - 2x - 3 = 0 ⟹ (x - 3)(x + 1) = 0 ⟹ x = 3 hoặc x = -1. Kiểm tra x = 3: [3²] = [9] = 9, 2x + 3 = 2×3 + 3 = 9. Phương trình thỏa mãn. Kiểm tra x = -1: [(-1)²] = [1] = 1, 2x + 3 = 2×(-1) + 3 = 1. Phương trình thỏa mãn. Vậy phương trình có 2 nghiệm nguyên là x = 3 và x = -1'
        },
        {
            'question_text': 'Cho hàm số f(x) = ax³ + bx² + cx + d, f\'(1) = 0, f\'(-1) = 0 và f(0) = 1, f(1) = 2. Tính f(-1)',
            'option_a': '4',
            'option_b': '0',
            'option_c': '2',
            'option_d': '-2',
            'correct_answer': 'B',
            'explanation': 'f\'(x) = 3ax² + 2bx + c. Từ f\'(1) = 0 và f\'(-1) = 0, ta có: 3a + 2b + c = 0 và 3a - 2b + c = 0. Trừ phương trình 1 cho phương trình 2: 4b = 0 ⟹ b = 0. Từ đó c = -3a. Bây giờ ta có f(x) = ax³ + 0·x² - 3ax + d = ax³ - 3ax + d. Từ f(0) = 1, ta suy ra d = 1. Từ f(1) = 2, ta có a·1³ - 3a·1 + 1 = 2 ⟹ a - 3a + 1 = 2 ⟹ -2a + 1 = 2 ⟹ -2a = 1 ⟹ a = -1/2. Vậy f(x) = -x³/2 + 3x/2 + 1. Tính f(-1) = -(-1)³/2 + 3(-1)/2 + 1 = -(-1)/2 - 3/2 + 1 = 1/2 - 3/2 + 1 = -1 + 1 = 0'
        },
        {
            'question_text': 'Tìm hàm nghịch đảo f⁻¹(x) của hàm số f(x) = (e^x - 1)/(e^x + 1) với x ∈ R',
            'option_a': 'f⁻¹(x) = ln((1 + x)/(1 - x))',
            'option_b': 'f⁻¹(x) = ln(x)',
            'option_c': 'f⁻¹(x) = e^x',
            'option_d': 'f⁻¹(x) = ln((1 - x)/(1 + x))',
            'correct_answer': 'A',
            'explanation': 'Đặt y = f(x) = (e^x - 1)/(e^x + 1). Ta có y(e^x + 1) = e^x - 1 ⟹ ye^x + y = e^x - 1 ⟹ ye^x - e^x = -y - 1 ⟹ e^x(y - 1) = -(y + 1) ⟹ e^x = -(y + 1)/(y - 1) = (1 + y)/(1 - y). Lấy logarit tự nhiên hai vế: x = ln((1 + y)/(1 - y)). Vậy f⁻¹(x) = ln((1 + x)/(1 - x))'
        },
        {
            'question_text': 'Tìm cực trị của hàm số f(x) = (x² - 1)e^(-x²/2) với x ∈ R',
            'option_a': 'Cực đại tại x = ±1 và cực tiểu tại x = ±√3',
            'option_b': 'Cực đại tại x = 0 và cực tiểu tại x = ±2',
            'option_c': 'Cực đại tại x = ±√3 và cực tiểu tại x = 0',
            'option_d': 'Cực đại tại x = 0 và cực tiểu tại x = ±1',
            'correct_answer': 'A',
            'explanation': 'f\'(x) = 2x·e^(-x²/2) + (x² - 1)·e^(-x²/2)·(-x) = e^(-x²/2)(2x - x³ + x) = x·e^(-x²/2)(3 - x²). f\'(x) = 0 khi x = 0 hoặc x = ±√3. f\'\'(x) = e^(-x²/2)(3 - x²) + x·e^(-x²/2)·(-2x) + x·(-x)·e^(-x²/2)·(3 - x²). f\'\'(0) = e^0·(3 - 0) = 3 > 0, nên x = 0 là cực tiểu. f\'\'(±√3) = ±√3·e^(-3/2)·(-2·(±√3)) + (±√3)·(-(±√3))·e^(-3/2)·(3 - 3) = ∓2·3·e^(-3/2) < 0, nên x = ±√3 là cực đại'
        },
        {
            'question_text': 'Tính: lim(x→0) (sin(3x) - 3sin(x))/x³',
            'option_a': '-9/2',
            'option_b': '3/2',
            'option_c': '0',
            'option_d': '3',
            'correct_answer': 'A',
            'explanation': 'Sử dụng khai triển Taylor: sin(x) = x - x³/6 + o(x³). Ta có sin(3x) = 3x - (3x)³/6 + o(x³) = 3x - 9x³/2 + o(x³). Vậy sin(3x) - 3sin(x) = 3x - 9x³/2 + o(x³) - 3(x - x³/6 + o(x³)) = 3x - 9x³/2 + o(x³) - 3x + 3x³/2 + o(x³) = -9x³/2 + 3x³/2 + o(x³) = -3x³ + o(x³). Vậy lim(x→0) (sin(3x) - 3sin(x))/x³ = lim(x→0) (-3x³ + o(x³))/x³ = -3 + lim(x→0) o(x³)/x³ = -3 + 0 = -3. Kiểm tra lại: Sử dụng công thức sin(3x) = 3sin(x) - 4sin³(x), ta có sin(3x) - 3sin(x) = 3sin(x) - 4sin³(x) - 3sin(x) = -4sin³(x). Vậy lim(x→0) (sin(3x) - 3sin(x))/x³ = lim(x→0) (-4sin³(x))/x³ = -4·lim(x→0) (sin(x)/x)³ = -4·1³ = -4. Và câu này một lần nữa: sin(3x) - 3sin(x) = 3sin(x) - 4sin³(x) - 3sin(x) = -4sin³(x). Sử dụng khai triển Taylor: sin(x) = x - x³/6 + o(x^5), ta có sin³(x) = (x - x³/6 + o(x^5))³ ≈ x³ - x⁵/2 + o(x^5). Vậy -4sin³(x) ≈ -4x³. Do đó, lim(x→0) (sin(3x) - 3sin(x))/x³ = lim(x→0) (-4sin³(x))/x³ = lim(x→0) (-4x³)/x³ = -4'
        },
        {
            'question_text': 'Tính tích phân: ∫(0→π) x·sin(2x) dx',
            'option_a': 'π²/2',
            'option_b': 'π/2',
            'option_c': 'π',
            'option_d': 'π²/4',
            'correct_answer': 'D',
            'explanation': 'Áp dụng phương pháp tích phân từng phần với u = x, dv = sin(2x)dx. Ta có du = dx, v = -cos(2x)/2. Vậy ∫x·sin(2x)dx = -x·cos(2x)/2 + ∫cos(2x)/2 dx = -x·cos(2x)/2 + sin(2x)/4 + C. Tích phân xác định là [-x·cos(2x)/2 + sin(2x)/4]_0^π = (-π·cos(2π)/2 + sin(2π)/4) - (0·cos(0)/2 + sin(0)/4) = (-π·1/2 + 0) - (0 + 0) = -π/2. Kiểm tra lại: sin(2x) = 2sin(x)cos(x). Ta có ∫(0→π) x·sin(2x) dx = ∫(0→π) 2x·sin(x)cos(x) dx = ∫(0→π) x·sin(2x) dx. Áp dụng phương pháp tích phân từng phần với u = x, dv = sin(2x)dx. Ta có du = dx, v = -cos(2x)/2. Vậy ∫x·sin(2x)dx = -x·cos(2x)/2 + ∫cos(2x)/2 dx = -x·cos(2x)/2 + sin(2x)/4 + C. Tích phân xác định là [-x·cos(2x)/2 + sin(2x)/4]_0^π = (-π·cos(2π)/2 + sin(2π)/4) - (0·cos(0)/2 + sin(0)/4) = (-π·1/2 + 0) - (0 + 0) = -π/2. Một lần nữa: ∫(0→π) x·sin(2x) dx. Áp dụng phương pháp tích phân từng phần với u = x, dv = sin(2x)dx. Ta có du = dx, v = -cos(2x)/2. Vậy ∫x·sin(2x)dx = -x·cos(2x)/2 + ∫cos(2x)/2 dx = -x·cos(2x)/2 + sin(2x)/4 + C. Tích phân xác định là [-x·cos(2x)/2 + sin(2x)/4]_0^π = (-π·cos(2π)/2 + sin(2π)/4) - (0·cos(0)/2 + sin(0)/4) = (-π/2 + 0) - (0 + 0) = -π/2'
        }
    ]
    
    # Thêm câu hỏi dễ vào database
    for q in easy_questions:
        question = Question(
            subject='Toán',
            grade=10,
            difficulty='Easy',
            question_text=q['question_text'],
            option_a=q['option_a'],
            option_b=q['option_b'],
            option_c=q['option_c'],
            option_d=q['option_d'],
            correct_answer=q['correct_answer'],
            explanation=q['explanation']
        )
        # Kiểm tra xem câu hỏi này đã tồn tại chưa (tránh trùng lặp)
        existing = Question.query.filter_by(
            subject='Toán', 
            grade=10, 
            question_text=q['question_text']
        ).first()
        
        if not existing:
            db.session.add(question)
    
    # Thêm câu hỏi trung bình vào database
    for q in medium_questions:
        question = Question(
            subject='Toán',
            grade=10,
            difficulty='Medium',
            question_text=q['question_text'],
            option_a=q['option_a'],
            option_b=q['option_b'],
            option_c=q['option_c'],
            option_d=q['option_d'],
            correct_answer=q['correct_answer'],
            explanation=q['explanation']
        )
        # Kiểm tra xem câu hỏi này đã tồn tại chưa (tránh trùng lặp)
        existing = Question.query.filter_by(
            subject='Toán', 
            grade=10, 
            question_text=q['question_text']
        ).first()
        
        if not existing:
            db.session.add(question)
    
    # Thêm câu hỏi khó vào database
    for q in hard_questions:
        question = Question(
            subject='Toán',
            grade=10,
            difficulty='Hard',
            question_text=q['question_text'],
            option_a=q['option_a'],
            option_b=q['option_b'],
            option_c=q['option_c'],
            option_d=q['option_d'],
            correct_answer=q['correct_answer'],
            explanation=q['explanation']
        )
        # Kiểm tra xem câu hỏi này đã tồn tại chưa (tránh trùng lặp)
        existing = Question.query.filter_by(
            subject='Toán', 
            grade=10, 
            question_text=q['question_text']
        ).first()
        
        if not existing:
            db.session.add(question)
    
    db.session.commit()

# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_key")

# Configure database with absolute path
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'instance', 'quiz.db'))
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Ensure instance directory exists
os.makedirs(os.path.dirname(db_path), exist_ok=True)

# Remove existing database if schema changed
if os.path.exists(db_path):
    os.remove(db_path)

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return redirect(url_for('homepage'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            if user.is_admin:
                return redirect(url_for('admin_dashboard'))
            return redirect(url_for('homepage'))
        flash('Tên đăng nhập hoặc mật khẩu không đúng')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        # Kiểm tra tên đăng nhập đã tồn tại chưa
        if User.query.filter_by(username=username).first():
            flash('Tên đăng nhập đã tồn tại')
            return redirect(url_for('register'))

        # Kiểm tra email đã tồn tại chưa
        if User.query.filter_by(email=email).first():
            flash('Email này hiện tại đã được sử dụng. Vui lòng chọn email khác.')
            return redirect(url_for('register'))

        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            coins=50  # New users start with 50 coins
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)

        # Tự động trao thành tựu "Người mới bắt đầu"
        from achievements import ACHIEVEMENTS
        for achievement in ACHIEVEMENTS:
            if achievement['name'] == "Người mới bắt đầu":
                # Tạo ID dựa trên tên thành tựu (tương tự như trong route advancements)
                achievement_id = hash(achievement['name']) % 10000

                # Kiểm tra nếu chưa có thành tựu này
                user_achievement = UserAchievement.query.filter_by(
                    user_id=user.id,
                    achievement_id=achievement_id
                ).first()

                if not user_achievement:
                    # Tạo thành tựu mới
                    user_achievement = UserAchievement(
                        user_id=user.id,
                        achievement_id=achievement_id
                    )
                    db.session.add(user_achievement)

                    # Trao phần thưởng
                    user.coins += achievement['coin_reward']
                    user.add_experience(achievement['xp_reward'])

                    db.session.commit()
                    flash(f'Bạn đã đạt được thành tựu: {achievement["name"]}!', 'success')

        return redirect(url_for('homepage'))
    return render_template('login.html', register=True)

@app.route('/homepage')
@login_required
def homepage():
    top_users = User.query.order_by(User.coins.desc()).limit(10).all()
    return render_template('homepage.html', 
                         user=current_user, 
                         top_users=top_users,
                         RANK_THRESHOLDS=RANK_THRESHOLDS)

@app.route('/mainquiz')
@login_required
def mainquiz():
    subjects = ['Toán', 'Văn', 'Hóa', 'Lý', 'Sinh', 
                'Sử', 'Địa',  'Kinh tế pháp luật', 'Tin học', 'Tiếng Anh']
    
    # Kiểm tra xem đã có câu hỏi Toán cho lớp 10 chưa
    math_questions = Question.query.filter_by(subject='Toán', grade=10, difficulty='Easy').count()
    
    # Nếu chưa có đủ câu hỏi, tạo 10 câu hỏi mẫu
    if math_questions < 10:
        create_sample_math_questions()
        print("Đã tạo 10 câu hỏi Toán mẫu")
    
    return render_template('mainquiz.html', subjects=subjects)

@app.route('/quiz')
@login_required
def quiz():
    subject = request.args.get('subject')
    difficulty = request.args.get('difficulty')
    grade = request.args.get('grade')
    
    # Nếu có các tham số cần thiết, hiển thị trang làm bài luôn
    if subject and difficulty and grade:
        # Kiểm tra xem người dùng có đủ xu không
        required_coins = {
            'easy': 10,
            'medium': 25,
            'hard': 50
        }
        
        if current_user.coins < required_coins.get(difficulty, 10):
            flash(f'Bạn không đủ xu để làm bài quiz này! Cần {required_coins.get(difficulty, 10)} xu.')
            return redirect(url_for('mainquiz'))
        
        return render_template('quiz.html', 
                              auto_start=True, 
                              selected_subject=subject, 
                              selected_difficulty=difficulty, 
                              selected_grade=grade)
    
    # Nếu không có tham số, hiển thị trang chọn môn học, lớp, độ khó
    subjects = ['Toán', 'Văn', 'Hóa', 'Lý', 'Sinh', 
                'Sử', 'Địa', 'Kinh tế pháp luật', 'Tin học', 'Tiếng Anh']
    grades = [10, 11, 12]
    return render_template('quiz.html', subjects=subjects, grades=grades, auto_start=False)

@app.route('/contribute', methods=['GET', 'POST'])
@login_required
def contribute():
    if request.method == 'POST':
        contribution = Contribution(
            subject=request.form.get('subject'),
            grade=request.form.get('grade'),
            question=request.form.get('question'),
            option_a=request.form.get('option_a'),
            option_b=request.form.get('option_b'),
            option_c=request.form.get('option_c'),
            option_d=request.form.get('option_d'),
            correct_answer=request.form.get('correct_answer'),
            explanation=request.form.get('explanation'),
            user_id=current_user.id
        )
        db.session.add(contribution)
        db.session.commit()

        # Kiểm tra thành tựu "Đóng góp đầu tiên"
        from achievements import ACHIEVEMENTS

        # Đếm số đóng góp của người dùng (bất kể được duyệt hay chưa)
        contributions_count = Contribution.query.filter_by(user_id=current_user.id).count()

        # Nếu đây là đóng góp đầu tiên, kiểm tra thành tựu
        if contributions_count == 1:
            for achievement in ACHIEVEMENTS:
                if achievement['name'] == "Đóng góp đầu tiên":
                    # Tạo ID dựa trên tên thành tựu
                    achievement_id = hash(achievement['name']) % 10000

                    # Kiểm tra xem đã đạt thành tựu này chưa
                    user_achievement = UserAchievement.query.filter_by(
                        user_id=current_user.id,
                        achievement_id=achievement_id
                    ).first()

                    if not user_achievement:
                        # Tạo thành tựu mới
                        user_achievement = UserAchievement(
                            user_id=current_user.id,
                            achievement_id=achievement_id,
                            notified=False,
                            created_at=datetime.utcnow()
                        )
                        db.session.add(user_achievement)

                        # Cộng phần thưởng
                        current_user.coins += achievement['coin_reward']
                        current_user.add_experience(achievement['xp_reward'])

                        db.session.commit()
                        flash(f'🏆 Bạn đã đạt thành tựu: {achievement["name"]}!', 'success')

        # Kiểm tra nhiệm vụ hằng ngày liên quan đến đóng góp câu hỏi
        today = datetime.utcnow().date()
        contribute_quest = DailyQuest.query.filter(
            DailyQuest.quest_date == today,
            DailyQuest.is_active == True,
            DailyQuest.description.like('%đóng góp%')
        ).first()

        if contribute_quest:
            user_quest = UserDailyQuest.query.filter_by(
                user_id=current_user.id,
                quest_id=contribute_quest.id
            ).first()

            if not user_quest:
                user_quest = UserDailyQuest(
                    user_id=current_user.id,
                    quest_id=contribute_quest.id,
                    completed=False
                )
                db.session.add(user_quest)
                db.session.commit()

            # Đánh dấu nhiệm vụ là đã hoàn thành (bất kể được duyệt hay không)
            if not user_quest.completed:
                user_quest.completed = True
                user_quest.completed_date = datetime.utcnow()

                # Cập nhật điểm nhiệm vụ hàng ngày
                current_user.daily_quest_points += contribute_quest.points
                if current_user.daily_quest_points > 100:
                    current_user.daily_quest_points = 100

                # Ghi thưởng cơ bản cho việc hoàn thành nhiệm vụ
                xp_reward = 5  # XP cơ bản cho việc hoàn thành nhiệm vụ
                current_user.add_experience(xp_reward)
                coin_reward = 5  # Xu cơ bản
                current_user.add_coins(coin_reward)

                db.session.commit()
                flash('Bạn đã hoàn thành nhiệm vụ "Đóng góp câu hỏi"! +5 XP, +5 xu', 'success')

        flash('Câu hỏi đã được gửi và đang chờ phê duyệt', 'success')
        return redirect(url_for('contribute'))

    return render_template('contribute.html')

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == 'admin' and password == 'admin123':
            user = User.query.filter_by(username='admin').first()
            if not user:
                user = User(
                    username='admin',
                    email='admin@example.com',
                    password_hash=generate_password_hash('admin123'),
                    is_admin=True
                )
                db.session.add(user)
                db.session.commit()
            login_user(user)
            return redirect(url_for('admin_dashboard'))
        flash('Invalid admin credentials')
    return render_template('admin/login.html')

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        return redirect(url_for('homepage'))

    # Statistics for dashboard
    total_users = User.query.count()
    pending_contributions = Contribution.query.filter_by(approved=False).count()
    total_questions = Question.query.count()

    # New users in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users = User.query.filter(User.id > 0).count()  # Placeholder until we add registration date

    # Top contributors
    top_contributors = db.session.query(
        User,
        func.count(Contribution.id).label('contributions')
    ).join(Contribution).group_by(User).order_by(
        func.count(Contribution.id).desc()
    ).limit(20).all()

    # Check if this is an AJAX request
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    return render_template('admin/dashboard.html',
        total_users=total_users,
        pending_contributions=pending_contributions,
        total_questions=total_questions,
        new_users=new_users,
        top_contributors=top_contributors,
        is_ajax=is_ajax
    )

@app.route('/admin/contributions')
@login_required
def admin_contributions():
    if not current_user.is_admin:
        return redirect(url_for('homepage'))

    pending_contributions = Contribution.query.filter_by(approved=False).all()
    return render_template('admin/contributions.html', contributions=pending_contributions)

@app.route('/admin/contribution/<int:id>/approve', methods=['POST'])
@login_required
def approve_contribution(id):
    if not current_user.is_admin:
        return redirect(url_for('homepage'))

    contribution = Contribution.query.get_or_404(id)
    difficulty = request.form.get('difficulty', 'Medium')
    contribution.approved = True

    # Create a new question from the contribution
    question = Question(
        subject=contribution.subject,
        grade=contribution.grade,
        difficulty=difficulty,  # Use selected difficulty
        question_text=contribution.question,
        option_a=contribution.option_a,
        option_b=contribution.option_b,
        option_c=contribution.option_c,
        option_d=contribution.option_d,
        correct_answer=contribution.correct_answer,
        explanation=contribution.explanation
    )

    # Award coins and XP to the contributor
    contributor = User.query.get(contribution.user_id)
    contributor.coins += 20
    contributor.add_experience(15)  # Tăng XP khi đóng góp được chấp nhận lên 15 XP

    # Check if this completes any achievements
    user_contributions = Contribution.query.filter_by(
        user_id=contributor.id, 
        approved=True
    ).count() + 1  # +1 for this one

    # Award achievement for contributions
    if user_contributions in [1, 5, 10, 25, 50]:
        achievement = Achievement.query.filter(
            Achievement.description.like(f"%{user_contributions} contribution%")
        ).first()

        if achievement:
            # Check if already achieved
            user_achievement = UserAchievement.query.filter_by(
                user_id=contributor.id,
                achievement_id=achievement.id
            ).first()

            if not user_achievement:
                user_achievement = UserAchievement(
                    user_id=contributor.id,
                    achievement_id=achievement.id
                )
                db.session.add(user_achievement)

                # Award rewards
                contributor.coins += achievement.coin_reward
                contributor.add_experience(achievement.xp_reward)

    db.session.add(question)
    db.session.commit()
    flash(f'Đã phê duyệt đóng góp với mức độ {difficulty} và tặng 20 xu cho người đóng góp')
    return redirect(url_for('admin_contributions'))

@app.route('/admin/contribution/<int:id>/reject', methods=['POST'])
@login_required
def reject_contribution(id):
    if not current_user.is_admin:
        return redirect(url_for('homepage'))

    contribution = Contribution.query.get_or_404(id)
    db.session.delete(contribution)
    db.session.commit()
    flash('Đã từ chối đóng góp')
    return redirect(url_for('admin_contributions'))

# Add these new routes after the existing admin routes

@app.route('/admin/users')
@login_required
def admin_users():
    if not current_user.is_admin:
        return redirect(url_for('homepage'))
    users = User.query.filter_by(is_admin=False).all()
    return render_template('admin/users.html', users=users)

@app.route('/admin/question_bank')
@login_required
def admin_question_bank():
    if not current_user.is_admin:
        return redirect(url_for('homepage'))

    subjects = ['Toán', 'Văn', 'Hóa', 'Lý', 'Sinh', 
                'Sử', 'Địa',  'Kinh tế pháp luật', 'Tin học', 'Tiếng Anh']
    grades = [10, 11, 12]

    # Get first page of questions
    questions = Question.query.order_by(Question.id.desc()).limit(20).all()

    return render_template('admin/question_bank.html', 
                          questions=questions, 
                          subjects=subjects, 
                          grades=grades)

@app.route('/api/questions')
@login_required
def get_questions():
    if not current_user.is_admin:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    # Get filter parameters
    subject = request.args.get('subject', '')
    grade = request.args.get('grade', '')
    difficulty = request.args.get('difficulty', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    # Build query
    query = Question.query

    if subject:
        query = query.filter_by(subject=subject)
    if grade:
        query = query.filter_by(grade=int(grade))
    if difficulty:
        query = query.filter_by(difficulty=difficulty)

    # Get total count for pagination
    total_count = query.count()
    total_pages = (total_count + per_page - 1) // per_page

    # Get paginated results
    questions = query.order_by(Question.id.desc()).offset((page - 1) * per_page).limit(per_page).all()

    # Format results
    questions_data = []
    for question in questions:
        questions_data.append({
            'id': question.id,
            'subject': question.subject,
            'grade': question.grade,
            'difficulty': question.difficulty,
            'question_text': question.question_text,
            'correct_answer': question.correct_answer
        })

    return jsonify({
        'success': True,
        'questions': questions_data,
        'total_pages': total_pages,
        'current_page': page
    })

@app.route('/api/question/<int:question_id>')
@login_required
def get_question(question_id):
    if not current_user.is_admin:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    question = Question.query.get_or_404(question_id)

    question_data = {
        'id': question.id,
        'subject': question.subject,
        'grade': question.grade,
        'difficulty': question.difficulty,
        'question_text': question.question_text,
        'option_a': question.option_a,
        'option_b': question.option_b,
        'option_c': question.option_c,
        'option_d': question.option_d,
        'correct_answer': question.correct_answer,
        'explanation': question.explanation
    }

    return jsonify({
        'success': True,
        'question': question_data
    })

@app.route('/api/question/<int:question_id>', methods=['DELETE'])
@login_required
def delete_question(question_id):
    if not current_user.is_admin:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    question = Question.query.get_or_404(question_id)

    db.session.delete(question)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Câu hỏi đã được xóa thành công'
    })

# Đã loại bỏ khả năng điều chỉnh xu của người dùng


@app.route('/admin/fortune-cookies', methods=['GET', 'POST'])
@login_required
def admin_fortune_cookies():
    if not current_user.is_admin:
        return redirect(url_for('homepage'))

    if request.method == 'POST':
        message = request.form.get('message')
        cookie = FortuneCookie(message=message)
        db.session.add(cookie)
        db.session.commit()
        flash('Fortune cookie added successfully')

    cookies = FortuneCookie.query.all()
    return render_template('admin/fortune_cookies.html', cookies=cookies)

@app.route('/admin/fortune-cookies/<int:cookie_id>/toggle', methods=['GET'])
@login_required
def admin_toggle_cookie(cookie_id):
    if not current_user.is_admin:
        return redirect(url_for('homepage'))

    cookie = FortuneCookie.query.get_or_404(cookie_id)
    cookie.is_active = not cookie.is_active
    db.session.commit()

    status = "activated" if cookie.is_active else "deactivated"
    flash(f'Fortune cookie {status} successfully')
    return redirect(url_for('admin_fortune_cookies'))

@app.route('/admin/fortune-cookies/<int:cookie_id>/delete', methods=['GET'])
@login_required
def admin_delete_cookie(cookie_id):
    if not current_user.is_admin:
        return redirect(url_for('homepage'))

    cookie = FortuneCookie.query.get_or_404(cookie_id)
    db.session.delete(cookie)
    db.session.commit()

    flash('Fortune cookie deleted successfully')
    return redirect(url_for('admin_fortune_cookies'))

@app.route('/admin/gacha-rewards', methods=['POST'])
@login_required
def admin_gacha_rewards():
    if not current_user.is_admin:
        return redirect(url_for('homepage'))

    # In a real implementation, this would save to a database table
    # For this example, we'll just show a success message

    names = request.form.getlist('reward_name[]')
    weights = request.form.getlist('reward_weight[]')
    items = request.form.getlist('reward_item[]')

    # Validate that we have the same number of each
    if len(names) != len(weights) or len(weights) != len(items):
        flash('Invalid form data', 'error')
        return redirect(url_for('admin_fortune_cookies'))

    # Process and save the rewards configuration
    # In a real implementation, save to database
    flash('Gacha rewards configuration saved successfully')
    return redirect(url_for('admin_fortune_cookies'))

@app.route('/event')
@login_required
def event():
    events = Event.query.all()
    return render_template('event.html', events=events)

@app.route('/shop')
@login_required
def shop():
    # Tự động hoàn thành nhiệm vụ "Ghé thăm cửa hàng" khi người dùng vào trang shop
    today = datetime.utcnow().date()
    shop_quest = DailyQuest.query.filter(
        DailyQuest.quest_date == today,
        DailyQuest.is_active == True,
        DailyQuest.description.like('%cửa hàng%')
    ).first()

    if shop_quest:
        user_quest = UserDailyQuest.query.filter_by(
            user_id=current_user.id,
            quest_id=shop_quest.id
        ).first()

        if not user_quest:
            user_quest = UserDailyQuest(
                user_id=current_user.id,
                quest_id=shop_quest.id
            )
            db.session.add(user_quest)

        if not user_quest.completed:
            user_quest.completed = True
            user_quest.completed_date = datetime.utcnow()

            # Cập nhật điểm nhiệm vụ hàng ngày
            current_user.daily_quest_points += shop_quest.points
            if current_user.daily_quest_points > 100:
                current_user.daily_quest_points = 100

            # Ghi thưởng
            xp_reward = 5  # XP cơ bản cho việc hoàn thành nhiệm vụ
            current_user.add_experience(xp_reward)
            coin_reward = 5  # Xu cơ bản
            current_user.add_coins(coin_reward)

            db.session.commit()
            flash('Bạn đã hoàn thành nhiệm vụ "Ghé thăm cửa hàng"!', 'success')

    return render_template('shop.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/fetch_questions', methods=['POST'])
@login_required
def fetch_questions():
    try:
        data = request.get_json()
        subject = data.get('subject')
        difficulty = data.get('difficulty')
        grade = data.get('grade', 10)

        if not subject:
            return jsonify({'success': False, 'message': 'Thiếu tham số môn học'}), 400

        # Khởi tạo danh sách câu hỏi
        questions_data = []
        
        # Nếu chọn mức độ cụ thể, lấy 10 câu hỏi ở mức độ đó
        if difficulty and difficulty != 'all':
            # Chuyển đổi từ lowercase sang proper case
            if difficulty == 'easy':
                difficulty_level = 'Easy'
            elif difficulty == 'medium':
                difficulty_level = 'Medium'
            elif difficulty == 'hard':
                difficulty_level = 'Hard'
            else:
                difficulty_level = difficulty
            
            # Query questions based on parameters
            questions_query = Question.query.filter_by(
                subject=subject,
                difficulty=difficulty_level,
                grade=grade
            )
            
            # Kiểm tra số lượng câu hỏi
            questions_count = questions_query.count()
            
            if questions_count < 10:
                return jsonify({
                    'success': False, 
                    'message': f'Không đủ câu hỏi cho môn {subject} ở mức độ {difficulty_level} cho lớp {grade}',
                    'count': questions_count
                })
            
            # Lấy 10 câu hỏi ngẫu nhiên
            questions = questions_query.order_by(func.random()).limit(10).all()
            
            # Format dữ liệu cho frontend
            for question in questions:
                questions_data.append({
                    'id': question.id,
                    'question_text': question.question_text,
                    'options': {
                        'A': question.option_a,
                        'B': question.option_b,
                        'C': question.option_c,
                        'D': question.option_d
                    },
                    'difficulty': question.difficulty
                })
                
            # Thời gian làm bài dựa trên độ khó
            time_limits = {
                'Easy': 90,  # 1m30s
                'Medium': 180,  # 3m
                'Hard': 300  # 5m
            }
            
            time_limit = time_limits.get(difficulty_level, 180)
        
        # Nếu không chọn mức độ cụ thể hoặc chọn all, lấy tổng cộng 10 câu hỏi từ các mức độ
        else:
            # Lấy tất cả câu hỏi có sẵn từ các mức độ
            easy_questions = Question.query.filter_by(subject=subject, difficulty='Easy', grade=grade).all()
            medium_questions = Question.query.filter_by(subject=subject, difficulty='Medium', grade=grade).all()
            hard_questions = Question.query.filter_by(subject=subject, difficulty='Hard', grade=grade).all()
            
            # Kiểm tra tổng số câu hỏi
            total_questions = len(easy_questions) + len(medium_questions) + len(hard_questions)
            
            if total_questions < 10:
                return jsonify({
                    'success': False, 
                    'message': f'Không đủ câu hỏi cho môn {subject} cho lớp {grade}',
                    'count': total_questions
                })
            
            # Tạo pool câu hỏi từ tất cả các mức độ
            all_questions = easy_questions + medium_questions + hard_questions
            
            # Chọn ngẫu nhiên 10 câu hỏi
            selected_questions = random.sample(all_questions, 10)
            
            # Format dữ liệu cho frontend
            for question in selected_questions:
                questions_data.append({
                    'id': question.id,
                    'question_text': question.question_text,
                    'options': {
                        'A': question.option_a,
                        'B': question.option_b,
                        'C': question.option_c,
                        'D': question.option_d
                    },
                    'difficulty': question.difficulty
                })
            
            # Thời gian làm bài cho đề tổng hợp: 5 phút
            time_limit = 300
        
        return jsonify({
            'success': True,
            'questions': questions_data,
            'time_limit': time_limit
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/answer_question', methods=['POST'])
@login_required
def answer_question():
    data = request.get_json()
    question_id = data.get('question_id')
    user_answer = data.get('answer')

    question = Question.query.get_or_404(question_id)
    is_correct = question.correct_answer == user_answer

    # Get current rank for comparison later
    old_rank = current_user.rank

    response = {
        'correct': is_correct,
        'correct_answer': question.correct_answer,
        'explanation': question.explanation
    }

    # Update user statistics
    current_user.total_questions_answered += 1

    if is_correct:
        current_user.correct_answers += 1

        # Update difficulty-specific counters
        if question.difficulty == 'Easy':
            current_user.easy_questions_completed += 1
            # 1 XP for Easy questions
            base_xp = 1
        elif question.difficulty == 'Medium':
            current_user.medium_questions_completed += 1
            # 3 XP for Medium questions
            base_xp = 3
        elif question.difficulty == 'Hard':
            current_user.hard_questions_completed += 1
            # 5 XP for Hard questions
            base_xp = 5
        else:
            base_xp = 1

        # Calculate base coin rewards
        base_coins = {
            'Easy': 5,
            'Medium': 10,
            'Hard': 15
        }.get(question.difficulty, 5)

        # Add XP and coins with rank bonuses
        xp_gained = current_user.add_experience(base_xp)
        coins_gained = current_user.add_coins(base_coins)

        # Track if user ranked up
        ranked_up = old_rank != current_user.rank

        response.update({
            'xp_gained': xp_gained,
            'coins_gained': coins_gained,
            'new_rank': current_user.rank,
            'new_xp': current_user.experience,
            'new_coins': current_user.coins,
            'ranked_up': ranked_up,
            'old_rank': old_rank
        })

        # Check for achievements
        check_quiz_achievements(current_user)

        db.session.commit()

    return jsonify(response)

def check_quiz_achievements(user):
    """Check and award quiz-related achievements"""
    # Get all achievements
    achievements = Achievement.query.all()
    user_achievements = UserAchievement.query.filter_by(user_id=user.id).all()
    achieved_ids = [ua.achievement_id for ua in user_achievements]

    for achievement in achievements:
        # Skip if already achieved
        if achievement.id in achieved_ids:
            continue

        # Check achievement conditions
        achieved = False

        if "complete 10 easy" in achievement.description.lower() and user.easy_questions_completed >= 10:
            achieved = True
        elif "complete 50 easy" in achievement.description.lower() and user.easy_questions_completed >= 50:
            achieved = True
        elif "complete 100 easy" in achievement.description.lower() and user.easy_questions_completed >= 100:
            achieved = True
        elif "complete 10 medium" in achievement.description.lower() and user.medium_questions_completed >= 10:
            achieved = True
        elif "complete 50 medium" in achievement.description.lower() and user.medium_questions_completed >= 50:
            achieved = True
        elif "complete 10 hard" in achievement.description.lower() and user.hard_questions_completed >= 10:
            achieved = True
        elif "answer 100 questions" in achievement.description.lower() and user.total_questions_answered >= 100:
            achieved = True
        elif "answer 500 questions" in achievement.description.lower() and user.total_questions_answered >= 500:
            achieved = True

        if achieved:
            # Create user achievement
            user_achievement = UserAchievement(
                user_id=user.id,
                achievement_id=achievement.id
            )
            db.session.add(user_achievement)

            # Award rewards
            user.coins += achievement.coin_reward
            user.add_experience(achievement.xp_reward)

            # Add item reward if applicable
            if achievement.item_reward:
                existing_item = InventoryItem.query.filter_by(
                    user_id=user.id,
                    item_name=achievement.item_reward,
                    is_used=False
                ).first()

                if existing_item:
                    existing_item.quantity += 1
                else:
                    inventory_item = InventoryItem(
                        user_id=user.id,
                        item_name=achievement.item_reward
                    )
                    db.session.add(inventory_item)

@app.route('/quiz_complete', methods=['POST'])
@login_required
def quiz_complete():
    data = request.get_json()
    score = data.get('score', 0)
    total = data.get('total', 10)
    subject = data.get('subject', '')
    action = data.get('action', '')

    # Tạo các nhiệm vụ hàng ngày nếu chưa tồn tại
    today = datetime.utcnow().date()
    daily_quests = DailyQuest.query.filter_by(quest_date=today, is_active=True).all()

    # Nếu không có nhiệm vụ nào, tạo một số nhiệm vụ mặc định
    if not daily_quests:
        # Tạo các nhiệm vụ mặc định dựa trên các hoạt động phổ biến
        default_quests = [
            {'description': 'Hoàn thành 1 bài quiz Toán', 'points': 20},
            {'description': 'Hoàn thành 1 bài quiz bất kỳ', 'points': 15},
            {'description': 'Đóng góp một câu hỏi mới', 'points': 25},
            {'description': 'Ghé thăm cửa hàng', 'points': 10},
            {'description': 'Đạt điểm tuyệt đối trong 1 bài quiz', 'points': 30}
        ]

        for quest_data in default_quests:
            quest = DailyQuest(
                description=quest_data['description'],
                points=quest_data['points'],
                quest_date=today,
                is_active=True
            )
            db.session.add(quest)

        db.session.commit()
        daily_quests = DailyQuest.query.filter_by(quest_date=today, is_active=True).all()

    # Kiểm tra các bản ghi UserDailyQuest và tạo nếu cần
    for quest in daily_quests:
        user_quest = UserDailyQuest.query.filter_by(
            user_id=current_user.id,
            quest_id=quest.id
        ).first()

        if not user_quest:
            user_quest = UserDailyQuest(
                user_id=current_user.id,
                quest_id=quest.id,
                completed=False
            )
            db.session.add(user_quest)

    db.session.commit()

    # Cập nhật lại danh sách sau khi tạo các bản ghi mới (nếu có)
    user_quests = UserDailyQuest.query.filter(
        UserDailyQuest.user_id == current_user.id,
        UserDailyQuest.quest_id.in_([q.id for q in daily_quests])
    ).all()

    # Tạo danh sách trạng thái nhiệm vụ
    quest_statuses = []
    for quest in daily_quests:
        user_quest = next((uq for uq in user_quests if uq.quest_id == quest.id), None)
        completed = user_quest.completed if user_quest else False

        quest_statuses.append({
            'id': quest.id,
            'description': quest.description,
            'points': quest.points,
            'completed': completed
        })

    # Nếu chỉ yêu cầu cập nhật UI
    if action == 'refresh':
        return jsonify({
            'success': True,
            'daily_points': current_user.daily_quest_points,
            'quest_statuses': quest_statuses,
            'new_xp': current_user.experience,
            'new_coins': current_user.coins
        })

    # Xử lý hoàn thành nhiệm vụ
    points_earned = 0
    milestone_rewards = 0
    completed_quests = []
    xp_earned = 0
    coin_rewards = 0

    for quest in daily_quests:
        user_quest = next((uq for uq in user_quests if uq.quest_id == quest.id), None)

        # Bỏ qua nhiệm vụ đã hoàn thành
        if not user_quest or user_quest.completed:
            continue

        # Kiểm tra hoàn thành nhiệm vụ
        quest_completed = False

        # Kiểm tra điều kiện hoàn thành dựa trên loại nhiệm vụ
        if subject and subject not in ['shop_visit', 'update_ui_only']:
            if "hoàn thành" in quest.description.lower() and "bất kỳ" in quest.description.lower():
                quest_completed = True
            elif "điểm tuyệt đối" in quest.description.lower() and score >= total:
                quest_completed = True
            elif subject.lower() in quest.description.lower():
                quest_completed = True
            elif "toán" in quest.description.lower() and "toán" in subject.lower():
                quest_completed = True
            elif "văn" in quest.description.lower() and "văn" in subject.lower():
                quest_completed = True

        # Kiểm tra nhiệm vụ ghé thăm cửa hàng
        elif subject == 'shop_visit' and "cửa hàng" in quest.description.lower():
            quest_completed = True

        # Nếu nhiệm vụ được hoàn thành
        if quest_completed:
            user_quest.completed = True
            user_quest.completed_date = datetime.utcnow()

            # Cập nhật trạng thái trong phản hồi
            for status in quest_statuses:
                if status['id'] == quest.id:
                    status['completed'] = True
                    break

            # Thêm điểm vào tiến độ nhiệm vụ hàng ngày
            previous_points = current_user.daily_quest_points
            current_user.daily_quest_points += quest.points
            points_earned += quest.points
            completed_quests.append(quest.description)

            # Thưởng XP cho việc hoàn thành nhiệm vụ (5 XP mỗi nhiệm vụ)
            xp_reward = 5
            current_user.experience += xp_reward
            xp_earned += xp_reward

            # Thưởng xu cơ bản cho việc hoàn thành nhiệm vụ
            base_coin_reward = 5
            current_user.coins += base_coin_reward
            coin_rewards += base_coin_reward

            # Kiểm tra phần thưởng cột mốc
            milestone_thresholds = [20, 40, 60, 80, 100]

            for threshold in milestone_thresholds:
                if previous_points < threshold and current_user.daily_quest_points >= threshold:
                    milestone_reward = threshold  # Phần thưởng bằng giá trị cột mốc
                    current_user.coins += milestone_reward
                    milestone_rewards += milestone_reward

                    # Thưởng thêm XP cho cột mốc (10 XP mỗi cột mốc)
                    milestone_xp = 10
                    current_user.experience += milestone_xp
                    xp_earned += milestone_xp

                    # Thêm thông báo cho cột mốc
                    completed_quests.append(f"Đạt mốc {threshold}% nhiệm vụ hàng ngày")
                    break

    # Đảm bảo không vượt quá 100 điểm
    if current_user.daily_quest_points > 100:
        current_user.daily_quest_points = 100

    # Kiểm tra thành tựu "Người hạnh phúc" nếu hoàn thành tất cả nhiệm vụ hàng ngày
    if current_user.daily_quest_points >= 100:
        from achievements import ACHIEVEMENTS
        for achievement in ACHIEVEMENTS:
            if achievement['name'] == "Người hạnh phúc":
                # Tạo ID dựa trên tên thành tựu
                achievement_id = hash(achievement['name']) % 10000

                # Kiểm tra nếu chưa có thành tựu này
                user_achievement = UserAchievement.query.filter_by(
                    user_id=current_user.id,
                    achievement_id=achievement_id
                ).first()

                if not user_achievement:
                    # Tạo thành tựu mới
                    user_achievement = UserAchievement(
                        user_id=current_user.id,
                        achievement_id=achievement_id,
                        notified=False,
                        created_at=datetime.utcnow()
                    )
                    db.session.add(user_achievement)

                    # Trao phần thưởng
                    current_user.coins += achievement['coin_reward']
                    current_user.experience += achievement['xp_reward']
                    xp_earned += achievement['xp_reward']
                    coin_rewards += achievement['coin_reward']

                    completed_quests.append(f"Đạt thành tựu: {achievement['name']}")

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Quest progress updated successfully',
        'daily_points': current_user.daily_quest_points,
        'points_earned': points_earned,
        'milestone_rewards': milestone_rewards,
        'coin_rewards': coin_rewards,
        'xp_earned': xp_earned,
        'new_xp': current_user.experience,
        'new_coins': current_user.coins,
        'completed_quests': completed_quests,
        'quest_statuses': quest_statuses
    })

@app.route('/api/check-achievements', methods=['GET'])
@login_required
def check_achievements():
    """API endpoint để kiểm tra các thành tựu mới đạt được"""
    from achievements import ACHIEVEMENTS

    # Danh sách thành tựu của người dùng chưa được thông báo
    new_achievements = UserAchievement.query.filter_by(
        user_id=current_user.id,
        notified=False
    ).all()

    new_achievement_ids = [ua.achievement_id for ua in new_achievements]

    # Thông tin chi tiết về thành tựu từ danh sách cứng
    new_achievement_data = []

    for achievement in ACHIEVEMENTS:
        achievement_id = hash(achievement['name']) % 10000

        if achievement_id in new_achievement_ids:
            new_achievement_data.append({
                'id': achievement_id,
                'name': achievement['name'],
                'description': achievement['description'],
                'xp_reward': achievement['xp_reward'],
                'coin_reward': achievement['coin_reward'],
                'item_reward': achievement['item_reward']
            })

    # Đánh dấu thành tựu đã hiển thị
    for ua in new_achievements:
        ua.notified = True

    db.session.commit()

    return jsonify({
        'success': True,
        'new_achievements': new_achievement_data
    })

@app.route('/api/complete-explorer-achievement', methods=['POST'])
@login_required
def complete_explorer_achievement():
    """API endpoint để hoàn thành thành tựu Nhà thám hiểm"""
    from achievements import ACHIEVEMENTS

    # Lấy danh sách trang đã ghé thăm từ request nếu có
    data = request.get_json()
    visited_pages = data.get('visited_pages', []) if data else []

    # Danh sách các trang cần thiết để đạt thành tựu - các mục chính trên thanh điều hướng
    required_pages = [
        '/homepage',
        '/contribute',
        '/shop',
        '/mainquiz',
        '/inventory',
        '/advancements',
        '/event',
        '/daily-quests'
    ]

    # Tìm thành tựu "Nhà thám hiểm" trong danh sách
    explorer_achievement = None
    for achievement in ACHIEVEMENTS:
        if achievement['name'] == "Nhà thám hiểm":
            explorer_achievement = achievement
            break

    if not explorer_achievement:
        return jsonify({'success': False, 'message': 'Không tìm thấy thành tựu'}), 404

    # Tạo ID dựa trên tên thành tựu
    achievement_id = hash(explorer_achievement['name']) % 10000

    # Kiểm tra xem người dùng đã có thành tựu này chưa
    user_achievement = UserAchievement.query.filter_by(
        user_id=current_user.id,
        achievement_id=achievement_id
    ).first()

    # Nếu đã có thành tựu, không làm gì cả
    if user_achievement:
        return jsonify({
            'success': True, 
            'achieved': False, 
            'message': 'Thành tựu đã được đạt trước đó'
        })

    # Kiểm tra số trang chính đã truy cập
    visited_main_pages = [page for page in visited_pages if page in required_pages]
    # Kiểm tra xem đã truy cập đủ các trang chưa (giờ chỉ cần 3 trang)
    has_visited_enough = len(visited_main_pages) >= 3

    # Nếu chưa truy cập đủ trang, vẫn trả về thành công nhưng không cấp thành tựu
    if not has_visited_enough and len(visited_pages) > 0:
        return jsonify({
            'success': True,
            'achieved': False,
            'message': f"Đã ghé thăm {len(visited_main_pages)}/{len(required_pages)} trang cần thiết",
            'visited': visited_main_pages,
            'required': required_pages
        })

    # Tạo thành tựu mới và cấp phần thưởng
    user_achievement = UserAchievement(
        user_id=current_user.id,
        achievement_id=achievement_id,
        notified=False,
        created_at=datetime.utcnow()
    )
    db.session.add(user_achievement)

    # Cộng xu và kinh nghiệm (sử dụng phương thức add_experience và add_coins)
    xp_earned = current_user.add_experience(explorer_achievement['xp_reward'])
    coins_earned = current_user.add_coins(explorer_achievement['coin_reward'])

    # Thêm vật phẩm nếu có
    if explorer_achievement['item_reward']:
        existing_item = InventoryItem.query.filter_by(
            user_id=current_user.id,
            item_name=explorer_achievement['item_reward'],
            is_used=False
        ).first()

        if existing_item:
            existing_item.quantity += 1
        else:
            inventory_item = InventoryItem(
                user_id=current_user.id,
                item_name=explorer_achievement['item_reward']
            )
            db.session.add(inventory_item)

    db.session.commit()

    # Thông báo thành công
    return jsonify({
        'success': True,
        'achieved': True,
        'message': f"Đã đạt thành tựu: {explorer_achievement['name']}",
        'reward_xp': xp_earned,
        'reward_coins': coins_earned,
        'reward_item': explorer_achievement['item_reward']
    })


# Update admin creation with 10,000 initial coins
with app.app_context():
    db.create_all()
    # Create admin user if it doesn't exist
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@example.com',
            password_hash=generate_password_hash('admin123'),
            is_admin=True,
            coins=10000  # Set initial coins to 10,000
        )
        db.session.add(admin)
        db.session.commit()
    elif admin.coins < 10000:  # Ensure existing admin has at least 10,000 coins
        admin.coins = 10000
        db.session.commit()

@app.route('/inventory')
@login_required
def inventory():
    inventory_items = InventoryItem.query.filter_by(user_id=current_user.id, is_used=False).order_by(InventoryItem.acquired_date.desc()).all()
    return render_template('inventory.html', inventory_items=inventory_items)

@app.route('/advancements')
@login_required
def advancements():
    from achievements import get_achievements_by_category

    # Get user's achievements
    user_achievements = UserAchievement.query.filter_by(user_id=current_user.id).all()
    achieved_ids = [ua.achievement_id for ua in user_achievements]

    # Get all achievements from the imported file
    achievement_categories = get_achievements_by_category()

    # Add achieved status to each achievement
    for category in achievement_categories:
        for achievement in achievement_categories[category]:
            # Create a unique ID for each achievement based on name (since ID is not in the static data)
            achievement_id = hash(achievement['name']) % 10000
            achievement['id'] = achievement_id
            achievement['achieved'] = achievement_id in achieved_ids

    # Get daily quests for the user
    daily_quests = []
    user_daily_quests = UserDailyQuest.query.filter_by(user_id=current_user.id).all()

    for user_quest in user_daily_quests:
        quest = DailyQuest.query.get(user_quest.quest_id)
        if quest:
            daily_quests.append({
                'description': quest.description,
                'points': quest.points,
                'completed': user_quest.completed
            })

    return render_template('advancements.html', 
                         achievements=achievement_categories, 
                         daily_quests=daily_quests, 
                         RANK_THRESHOLDS=RANK_THRESHOLDS)

@app.route('/daily-quests')
@login_required
def daily_quests():
    # Get daily quests for the user
    today = datetime.utcnow().date()
    daily_quests = []
    all_quests = DailyQuest.query.filter_by(quest_date=today, is_active=True).all()

    for quest in all_quests:
        user_quest = UserDailyQuest.query.filter_by(
            user_id=current_user.id,
            quest_id=quest.id
        ).first()

        # Đối với mỗi loại nhiệm vụ, gán một liên kết phù hợp
        quest_link = url_for('homepage')  # Mặc định

        if "toán" in quest.description.lower():
            quest_link = url_for('mainquiz', subject='Toán')
        elif "văn" in quest.description.lower():
            quest_link = url_for('mainquiz', subject='Văn')
        elif "quiz" in quest.description.lower():
            quest_link = url_for('mainquiz')
        elif "đóng góp" in quest.description.lower():
            quest_link = url_for('contribute')
        elif "cửa hàng" in quest.description.lower() or "shop" in quest.description.lower():
            quest_link = url_for('shop')

        daily_quests.append({
            'id': quest.id,
            'description': quest.description,
            'points': quest.points,
            'completed': user_quest.completed if user_quest else False,
            'link': quest_link
        })

    # Nếu không có nhiệm vụ nào, tạo một số nhiệm vụ mặc định
    if not daily_quests:
        default_quests = [
            {'description': 'Hoàn thành 1 bài quiz Toán', 'points': 20, 'link': url_for('mainquiz', subject='Toán')},
            {'description': 'Hoàn thành 1 bài quiz bất kỳ', 'points': 15, 'link': url_for('mainquiz')},
            {'description': 'Đóng góp một câu hỏi mới', 'points': 25, 'link': url_for('contribute')},
            {'description': 'Ghé thăm cửa hàng', 'points': 10, 'link': url_for('shop')},
            {'description': 'Đạt điểm tuyệt đối trong 1 bài quiz', 'points': 30, 'link': url_for('mainquiz')}
        ]

        for quest_data in default_quests:
            daily_quests.append({
                'id': 0,  # ID giả
                'description': quest_data['description'],
                'points': quest_data['points'],
                'completed': False,
                'link': quest_data['link']
            })

    return render_template('daily_quests.html', daily_quests=daily_quests)

@app.route('/api/purchase', methods=['POST'])
@login_required
def purchase_item():
    try:
        data = request.get_json()
        item_name = data.get('item')
        cost = data.get('cost')

        if not item_name or not cost:
            return jsonify({'success': False, 'message': 'Invalid purchase data'}), 400

        # Double-check if user has enough coins
        if current_user.coins < cost:
            return jsonify({'success': False, 'message': 'Bạn không đủ tiền để mua nó'}), 400

        # Determine item type based on name
        item_type = 'help_item'
        if item_name in ['Gacha', 'Hair Style', 'Skin Tone', 'Accessory']:
            item_type = 'customization'

        # Create purchase record
        purchase = Purchase(
            user_id=current_user.id,
            item_type=item_type,
            item_name=item_name,
            cost=cost
        )

        # Add to inventory
        existing_item = InventoryItem.query.filter_by(
            user_id=current_user.id,
            item_name=item_name,
            is_used=False
        ).first()

        if existing_item:
            existing_item.quantity += 1
        else:
            inventory_item = InventoryItem(
                user_id=current_user.id,
                item_name=item_name
            )
            db.session.add(inventory_item)

        # Deduct coins
        current_user.coins -= cost

        db.session.add(purchase)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Mua hàng thành công',
            'newBalance': current_user.coins
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/gacha', methods=['GET'])
@login_required
def gacha_pull():
    try:
        # Get all active fortune cookies
        cookies = FortuneCookie.query.filter_by(is_active=True).all()

        if not cookies:
            return jsonify({'success': False, 'message': 'No fortune cookies available'}), 404

        # Define the rewards and their weights
        # These would ideally come from a database table that admins can configure
        rewards = [
            {'name': 'Have a nice day', 'description': 'Just a nice message. Better luck next time!', 'weight': 40},
            {'name': '50/50 Help', 'description': 'You received a 50/50 help item!', 'weight': 25, 'item': '50/50'},
            {'name': 'Skip Question', 'description': 'You received a Skip Question item!', 'weight': 15, 'item': 'Skip Question'},
            {'name': '20% Coin Boost', 'description': 'Your next quiz will earn 20% more coins!', 'weight': 10, 'item': 'Coin Boost'},
            {'name': 'Free Entrance Ticket', 'description': 'You received a free event entrance ticket!', 'weight': 10, 'item': 'Event Ticket'}
        ]

        # Calculate total weight
        total_weight = sum(reward['weight'] for reward in rewards)

        # Generate 8 rewards based on weights to distribute in the cookies
        # This ensures the distribution matches the overall probabilities
        cookie_rewards = []
        for _ in range(8):
            random_value = random.randint(1, total_weight)
            current_weight = 0

            for reward in rewards:
                current_weight += reward['weight']
                if random_value <= current_weight:
                    # Create a copy of the reward to avoid reference issues
                    cookie_rewards.append(reward.copy())
                    break

        # Shuffle the rewards to randomize their positions
        random.shuffle(cookie_rewards)

        # Get a random fortune cookie message for each reward
        for reward in cookie_rewards:
            cookie = random.choice(cookies)
            reward['message'] = cookie.message

        # Return all the rewards without adding to inventory yet
        # The actual selection and inventory addition will happen when the user
        # selects a specific cookie
        return jsonify({
            'success': True,
            'rewards': cookie_rewards
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/gacha/select', methods=['POST'])
@login_required
def select_gacha_reward():
    try:
        data = request.get_json()
        cookie_index = data.get('index')
        reward_data = data.get('reward')

        if cookie_index is None or not reward_data:
            return jsonify({'success': False, 'message': 'Invalid selection data'}), 400

        # Add the item to inventory if this reward includes an item
        if 'item' in reward_data:
            existing_item = InventoryItem.query.filter_by(
                user_id=current_user.id,
                item_name=reward_data['item'],
                is_used=False
            ).first()

            if existing_item:
                existing_item.quantity += 1
            else:
                inventory_item = InventoryItem(
                    user_id=current_user.id,
                    item_name=reward_data['item']
                )
                db.session.add(inventory_item)

            db.session.commit()

        return jsonify({
            'success': True,
            'message': f'You received: {reward_data["name"]}'
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/update-profile', methods=['POST'])
@login_required
def update_profile():
    try:
        data = request.get_json()
        customization_type = data.get('type')
        option = data.get('option')
        cost = data.get('cost')

        if not customization_type or not option or not cost:
            return jsonify({'success': False, 'message': 'Invalid data'}), 400

        if current_user.coins < cost:
            return jsonify({'success': False, 'message': 'Không đủ xu'}), 400

        # Get or create user profile
        profile = UserProfile.query.filter_by(user_id=current_user.id).first()
        if not profile:
            profile = UserProfile(user_id=current_user.id)
            db.session.add(profile)

        # Update profile based on customization type
        if customization_type == 'hair':
            profile.hair_style = option
        elif customization_type == 'skin':
            profile.skin_color = option
        elif customization_type == 'accessory':
            profile.accessory = option

        # Deduct coins
        current_user.coins -= cost

        # Create purchase record
        purchase = Purchase(
            user_id=current_user.id,
            item_type='customization',
            item_name=f"{customization_type}_{option}",
            cost=cost
        )
        db.session.add(purchase)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'newBalance': current_user.coins
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)