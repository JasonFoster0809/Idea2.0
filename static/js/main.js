// Enhanced UI interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add animation classes to elements
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
        heading.classList.add('animated-element');
        heading.style.animationDelay = `${index * 0.1}s`;
    });

    // Add hover effect to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(67, 97, 238, 0.2)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--box-shadow)';
        });
    });

    // Add subtle parallax effect to background
    document.addEventListener('mousemove', function(e) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

        document.body.style.backgroundPosition = `${moveX}px ${moveY}px`;
    });

    // Add fade-in animations to cards and elements
    const animatedElements = document.querySelectorAll('.card, .achievement-card');
    if (animatedElements.length > 0) {
        animatedElements.forEach((element, index) => {
            element.classList.add('fade-in');
            element.classList.add(`delay-${(index % 3) + 1}`);
        });
    }


    // Tabs animation
    const tabButtons = document.querySelectorAll('.nav-tabs .nav-link');
    if (tabButtons.length > 0) {
        tabButtons.forEach(tab => {
            tab.addEventListener('click', function() {
                // Add click effect
                this.classList.add('tab-clicked');
                setTimeout(() => {
                    this.classList.remove('tab-clicked');
                }, 300);
            });
        });
    }

    // Progress bar animation
    const progressBars = document.querySelectorAll('.progress-bar');
    if (progressBars.length > 0) {
        progressBars.forEach(bar => {
            const value = bar.getAttribute('aria-valuenow');
            // Start at 0 width
            bar.style.width = '0%';

            // Use setTimeout to allow the initial 0% to render
            setTimeout(() => {
                // Animate to actual value
                bar.style.width = `${value}%`;
            }, 300);
        });
    }

    // Make milestone rewards interactive
    const milestones = document.querySelectorAll('.reward-milestone');
    if (milestones.length > 0) {
        milestones.forEach(milestone => {
            milestone.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
            });

            milestone.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });

            milestone.addEventListener('click', function() {
                if (this.classList.contains('milestone-reached')) {
                    const points = this.getAttribute('data-milestone');
                    showMilestoneTooltip(this, `Mốc ${points} điểm đã đạt được!`);
                } else {
                    const points = this.getAttribute('data-milestone');
                    showMilestoneTooltip(this, `Cần đạt ${points} điểm để nhận thưởng`);
                }
            });
        });
    }

    // Enhance navbar with active link highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href) && href !== '/') {
            link.classList.add('active');
        }
    });

    // Add animation to achieved cards
    const achievedCards = document.querySelectorAll('.achievement-card.achieved');
    achievedCards.forEach((card) => {
        card.classList.add('achieved');
    });

    // Add tooltips for rewards (requires Bootstrap)
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipList = tooltipTriggerList.map(tooltipTriggerEl =>
            new bootstrap.Tooltip(tooltipTriggerEl)
        );
    }

    //This part is moved to the end to avoid conflicts.

    // Add hover effects to cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    animateProgressBars();

    // Add smooth transition to quiz options
    const quizOptions = document.querySelectorAll('.option-item');
    if (quizOptions.length > 0) {
        quizOptions.forEach(option => {
            option.addEventListener('click', function() {
                quizOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }

    // Animate all elements with data-count attribute
    document.querySelectorAll('[data-count]').forEach(el => {
        const final = parseInt(el.getAttribute('data-count'), 10);
        animateValue(el, 0, final, 2000);
    });

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })


    // Handle quest completion for shop visits
    if (window.location.pathname.includes('/shop')) {
        // Send request to mark shop visit quest as complete
        fetch('/quiz_complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score: 0,
            total: 0,
            subject: 'shop_visit'
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success && data.completed_quests && data.completed_quests.length > 0) {
            // Show notifications for completed quests
            data.completed_quests.forEach(quest => {
              showToast(`Nhiệm vụ hoàn thành: ${quest}`, 'success');
            });

            // Show rewards
            if (data.points_earned > 0) {
              showToast(`Nhận được ${data.points_earned} điểm nhiệm vụ!`, 'success');
            }

            if (data.xp_earned > 0) {
              showToast(`Nhận được ${data.xp_earned} điểm kinh nghiệm!`, 'success');
            }

            if (data.milestone_rewards > 0) {
              showToast(`Nhận được ${data.milestone_rewards} xu từ phần thưởng!`, 'success');
            }

            // Update user stats in the UI
            updateUserStats(data);
          }
        })
        .catch(error => console.error('Error:', error));
    }

    // Handle "Visit Shop" button clicks on daily quests page
    document.querySelectorAll('.btn-outline-primary').forEach(button => {
      button.addEventListener('click', function(e) {
        const questItem = this.closest('.list-group-item');
        const questDescription = questItem.querySelector('h5').textContent;

        if (questDescription.includes('Ghé thăm cửa hàng')) {
          // Update UI immediately for better user experience
          const badge = questItem.querySelector('.badge');
          if (badge) {
            badge.classList.remove('bg-secondary');
            badge.classList.add('bg-success');
            badge.innerHTML = '<i class="fas fa-check"></i>';
          }

          this.textContent = 'Hoàn thành';
          this.classList.remove('btn-outline-primary');
          this.classList.add('bg-success', 'text-white');
          this.disabled = true;
        }
      });
    });

    // Handle quest progress updates
    updateQuestProgress();

    // Xử lý việc truy cập cửa hàng (shop) cho nhiệm vụ hằng ngày
    const currentPath2 = window.location.pathname;

    // Nếu đang ở trang shop, gửi thông báo để cập nhật nhiệm vụ hằng ngày
    if (currentPath2 === '/shop') {
        fetch('/quiz_complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject: 'shop_visit'
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Shop visit quest data:', data);

            if (data.completed_quests && data.completed_quests.length > 0) {
                // Hiển thị thông báo nếu có nhiệm vụ nào được hoàn thành
                showToast('Nhiệm vụ hoàn thành!', 'success');

                // Hiển thị thông báo với chi tiết phần thưởng
                if (data.coin_rewards > 0 || data.xp_earned > 0) {
                    let rewardMessage = 'Bạn nhận được ';
                    if (data.coin_rewards > 0) {
                        rewardMessage += data.coin_rewards + ' xu';
                    }
                    if (data.xp_earned > 0) {
                        rewardMessage += (data.coin_rewards > 0 ? ' và ' : '') + data.xp_earned + ' XP';
                    }
                    showToast(rewardMessage, 'success', 5000);
                }

                // Cập nhật UI nhiệm vụ nếu đang ở trang nhiệm vụ
                updateQuestUI();
            }
        })
        .catch(error => {
            console.error('Error updating shop visit quest:', error);
        });
    }

    // Cập nhật UI cho trang nhiệm vụ hàng ngày nếu đang ở trang đó
    if (currentPath2 === '/daily-quests') {
        updateQuestUI();
    }

    // Khởi tạo danh sách các trang đã truy cập từ localStorage
    const storedPages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
    visitedPages = new Set(storedPages);

    // Ghi lại trang hiện tại
    trackPageVisit();

    // Kiểm tra thành tựu định kỳ
    checkAchievements();

    //This part is moved here to avoid conflicts.
    // Refresh stats immediately when page loads
    refreshDashboardStats();

    // Set up auto-refresh if on admin dashboard
    if (window.location.pathname.includes('/admin/dashboard')) {
        console.log('Dashboard detected, setting up auto-refresh');
        setInterval(refreshDashboardStats, 5000); // Refresh more frequently (every 5 seconds)
    }

    // Initialize tooltips
    const tooltipTriggerList2 = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltipTriggerList2.length > 0) {
      [...tooltipTriggerList2].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    // Quiz logic
    setupQuiz();

    // Shop functionality
    setupShop();

    // Advancements functionality
    setupAdvancements();

    // Achievement notification check
    checkNewAchievements();
});

// Helper functions
function showElement(element) {
    element.style.display = 'block';
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 50);
}

function hideElement(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    setTimeout(() => {
        element.style.display = 'none';
    }, 300); // Match the transition duration
}

function showMilestoneTooltip(element, message) {
    // Check if tooltip already exists
    let tooltip = document.querySelector('.milestone-tooltip');
    if (tooltip) {
        tooltip.remove();
    }

    // Create new tooltip
    tooltip = document.createElement('div');
    tooltip.className = 'milestone-tooltip';
    tooltip.textContent = message;
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.fontSize = '0.8rem';
    tooltip.style.zIndex = '1000';
    tooltip.style.width = 'max-content';
    tooltip.style.maxWidth = '200px';
    tooltip.style.textAlign = 'center';
    tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    tooltip.style.transition = 'opacity 0.3s';

    // Append to body
    document.body.appendChild(tooltip);

    // Position the tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10 + window.scrollY}px`;
    tooltip.style.left = `${rect.left + rect.width/2 - tooltip.offsetWidth/2 + window.scrollX}px`;

    // Add arrow
    tooltip.style.setProperty('--tooltip-arrow-size', '6px');
    tooltip.style.setProperty('--tooltip-arrow-color', 'rgba(0, 0, 0, 0.8)');

    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.bottom = '-6px';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '6px solid transparent';
    arrow.style.borderRight = '6px solid transparent';
    arrow.style.borderTop = '6px solid rgba(0, 0, 0, 0.8)';

    tooltip.appendChild(arrow);

    // Show with animation
    tooltip.style.opacity = '0';
    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 10);

    // Hide after 2 seconds
    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            tooltip.remove();
        }, 300);
    }, 2000);
}

// Custom alert function
function showAlert(message, type = 'info') {
    // Check if SweetAlert is available
    if (typeof Swal !== 'undefined') {
        const iconMap = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        Swal.fire({
            title: '',
            text: message,
            icon: iconMap[type] || 'info',
            confirmButtonColor: '#3a7bd5',
            confirmButtonText: 'Đóng'
        });
    } else {
        // Fallback to standard alert
        alert(message);
    }
}

// Add polished scrolling effect for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Add CSS3 variables for dynamic theming capabilities
const root = document.documentElement;

// Set theme colors
const setTheme = (primary, secondary) => {
    root.style.setProperty('--primary-color', primary);
    root.style.setProperty('--secondary-color', secondary);

    // Update dependent variables
    const darkColor = adjustColor(primary, -30);
    root.style.setProperty('--dark-color', darkColor);
};

// Helper function to adjust color brightness
function adjustColor(color, percent) {
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;  
    G = (G < 255) ? G : 255;  
    B = (B < 255) ? B : 255;  

    const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

// Initialize components when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-in-out'
        });
    }

    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});


// Use a custom showAlert function that works with or without SweetAlert
function showAlert(message, type) {
    const icon = type === 'error' ? 'error' : 'success';
    Swal.fire({
        title: type === 'error' ? 'Lỗi!' : 'Thành công!',
        text: message,
        icon: icon,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
            popup: 'animated fadeInDown faster'
        }
    });
}

// Generic function to show alerts using SweetAlert2 if available
function showAlert2(title, message, type = 'info') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: title,
            text: message,
            icon: type,
            confirmButtonText: 'OK'
        });
    } else {
        alert(message);
    }
}

// Utility function to format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}


// Update user coins display
function updateUserCoins(newBalance) {
    const coinsElement = document.querySelector('.nav-link:contains("🪙")');
    if (coinsElement) {
        coinsElement.textContent = `🪙 ${newBalance}`;
    }
}

// Add a class to elements with data-aos attribute on mobile
function handleMobileAnimations() {
    if (window.innerWidth < 768) {
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.classList.add('aos-animate');
        });
    }
}

// Handle responsive design
window.addEventListener('resize', handleMobileAnimations);
handleMobileAnimations();

// Progress bar animation
function animateProgressBars() {
    document.querySelectorAll('.progress-bar').forEach(bar => {
        const width = bar.getAttribute('aria-valuenow') + '%';
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}


// Check for new achievements
function checkNewAchievements() {
  // Only run on pages where the user is logged in
  if (document.querySelector('.user-info')) {
    fetch('/api/check-achievements')
      .then(response => response.json())
      .then(data => {
        if (data.success && data.new_achievements && data.new_achievements.length > 0) {
          data.new_achievements.forEach(achievement => {
            showAchievementNotification(achievement);
          });
        }
      })
      .catch(error => console.error('Error checking achievements:', error));
  }
}

// Show achievement notification
function showAchievementNotification(achievement) {
  const notificationHtml = `
    <div class="achievement-notification">
      <div class="achievement-icon">
        <i class="fas fa-trophy"></i>
      </div>
      <div class="achievement-details">
        <h4>${achievement.name}</h4>
        <p>${achievement.description}</p>
        <div class="achievement-rewards">
          ${achievement.xp_reward > 0 ? `<span class="badge bg-primary">+${achievement.xp_reward} XP</span>` : ''}
          ${achievement.coin_reward > 0 ? `<span class="badge bg-warning text-dark">+${achievement.coin_reward} Xu</span>` : ''}
          ${achievement.item_reward ? `<span class="badge bg-success">+${achievement.item_reward}</span>` : ''}
        </div>
      </div>
    </div>
  `;

  const notification = document.createElement('div');
  notification.className = 'achievement-toast';
  notification.innerHTML = notificationHtml;
  document.body.appendChild(notification);

  // Show with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Hide after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}

// Setup quiz functionality
function setupQuiz() {
  const quizContainer = document.querySelector('#quiz-container');
  if (!quizContainer) return;

  const startQuizBtn = document.querySelector('#start-quiz');
  const quizForm = document.querySelector('#quiz-form');

  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', function() {
      const subject = document.querySelector('#subject').value;
      const grade = document.querySelector('#grade').value;
      const difficulty = document.querySelector('#difficulty').value;

      if (!subject || !difficulty) {
        showToast('Vui lòng chọn môn học và độ khó', 'warning');
        return;
      }

      document.querySelector('#quiz-setup').classList.add('d-none');
      document.querySelector('#loading-quiz').classList.remove('d-none');

      fetch('/fetch_questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject,
          difficulty: difficulty,
          grade: parseInt(grade)
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          renderQuiz(data.questions, data.time_limit);
          startTimer(data.time_limit);

          document.querySelector('#loading-quiz').classList.add('d-none');
          document.querySelector('#quiz-content').classList.remove('d-none');
        } else {
          showToast(data.message, 'danger');
          document.querySelector('#loading-quiz').classList.add('d-none');
          document.querySelector('#quiz-setup').classList.remove('d-none');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showToast('Có lỗi xảy ra khi tải câu hỏi', 'danger');
        document.querySelector('#loading-quiz').classList.add('d-none');
        document.querySelector('#quiz-setup').classList.remove('d-none');
      });
    });
  }
}

// Render quiz questions
function renderQuiz(questions, timeLimit) {
  const quizContent = document.querySelector('#quiz-questions');
  if (!quizContent) return;

  quizContent.innerHTML = '';

  questions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-card mb-4';
    questionDiv.setAttribute('data-question-id', question.id);

    let optionsHtml = '';
    for (const [key, value] of Object.entries(question.options)) {
      optionsHtml += `
        <div class="form-check question-option">
          <input class="form-check-input" type="radio" name="question-${question.id}" id="option-${question.id}-${key}" value="${key}">
          <label class="form-check-label w-100" for="option-${question.id}-${key}">
            <span class="option-label">${key}</span> ${value}
          </label>
        </div>
      `;
    }

    questionDiv.innerHTML = `
      <div class="card shadow">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="m-0">Câu hỏi ${index + 1}</h5>
          <span class="badge bg-${question.difficulty === 'Easy' ? 'success' : question.difficulty === 'Medium' ? 'warning' : 'danger'}">
            ${question.difficulty}
          </span>
        </div>
        <div class="card-body">
          <p class="question-text">${question.question_text}</p>
          <div class="options-container">
            ${optionsHtml}
          </div>
          <div class="result-feedback mt-3 d-none"></div>
        </div>
      </div>
    `;

    quizContent.appendChild(questionDiv);

    // Add event listeners to each option
    const options = questionDiv.querySelectorAll('.form-check-input');
    options.forEach(option => {
      option.addEventListener('change', function() {
        if (this.checked) {
          const questionId = this.name.split('-')[1];
          const answer = this.value;
          submitAnswer(questionId, answer, this);
        }
      });
    });
  });

  // Add submit button
  const submitDiv = document.createElement('div');
  submitDiv.className = 'text-center mt-4';
  submitDiv.innerHTML = `
    <button id="finish-quiz" class="btn btn-primary btn-lg">Hoàn thành bài quiz</button>
  `;
  quizContent.appendChild(submitDiv);

  // Add event listener to submit button
  const finishBtn = document.querySelector('#finish-quiz');
  if (finishBtn) {
    finishBtn.addEventListener('click', function() {
      finishQuiz();
    });
  }
}

// Submit an answer
function submitAnswer(questionId, answer, radioElement) {
  fetch('/answer_question', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question_id: questionId,
      answer: answer
    })
  })
  .then(response => response.json())
  .then(data => {
    const questionCard = radioElement.closest('.question-card');
    const resultFeedback = questionCard.querySelector('.result-feedback');

    resultFeedback.classList.remove('d-none');

    if (data.correct) {
      resultFeedback.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-check-circle"></i> Đúng! 
          ${data.xp_gained ? `<span class="badge bg-primary">+${data.xp_gained} XP</span>` : ''}
          ${data.coins_gained ? `<span class="badge bg-warning text-dark">+${data.coins_gained} Xu</span>` : ''}
          ${data.explanation ? `<p class="mt-2">${data.explanation}</p>` : ''}
        </div>
      `;

      // Update the options to show correct answer
      const options = questionCard.querySelectorAll('.question-option');
      options.forEach(option => {
        if (option.querySelector('input').value === answer) {
          option.classList.add('correct-answer');
        } else {
          option.classList.add('disabled');
          option.querySelector('input').disabled = true;
        }
      });

      // If user ranked up, show notification
      if (data.ranked_up) {
        showToast(`Chúc mừng! Bạn đã thăng cấp lên ${data.new_rank}!`, 'success');
      }

    } else {
      resultFeedback.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-times-circle"></i> Sai! Đáp án đúng là: ${data.correct_answer}
          ${data.explanation ? `<p class="mt-2">${data.explanation}</p>` : ''}
        </div>
      `;

      // Update the options to show correct vs wrong answers
      const options = questionCard.querySelectorAll('.question-option');
      options.forEach(option => {
        const optionInput = option.querySelector('input');
        if (optionInput.value === data.correct_answer) {
          option.classList.add('correct-answer');
        } else if (optionInput.value === answer) {
          option.classList.add('wrong-answer');
        } else {
          option.classList.add('disabled');
          optionInput.disabled = true;
        }
      });
    }

    // Disable all inputs for this question
    const inputs = questionCard.querySelectorAll('.form-check-input');
    inputs.forEach(input => {
      input.disabled = true;
    });

    // Update UI with new stats if available
    if (data.new_xp !== undefined && data.new_coins !== undefined) {
      updateUserStats({
        new_xp: data.new_xp,
        new_coins: data.new_coins
      });
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showToast('Có lỗi xảy ra khi gửi câu trả lời', 'danger');
  });
}

// Timer functionality
function startTimer(seconds) {
  const timerDisplay = document.querySelector('#timer');
  if (!timerDisplay) return;

  let timeLeft = seconds;
  updateTimerDisplay(timeLeft);

  const timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);

  // Store the interval ID in a data attribute for later cleanup
  timerDisplay.dataset.intervalId = timerInterval;
}

function updateTimerDisplay(seconds) {
  const timerDisplay = document.querySelector('#timer');
  if (!timerDisplay) return;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  timerDisplay.textContent = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;

  // Add warning classes when time is running low
  if (seconds < 30) {
    timerDisplay.classList.add('text-danger');
    timerDisplay.classList.add('timer-warning');
  }
}

// Finish quiz
function finishQuiz() {
  // Clear any active timer
  const timerDisplay = document.querySelector('#timer');
  if (timerDisplay && timerDisplay.dataset.intervalId) {
    clearInterval(timerDisplay.dataset.intervalId);
  }

  // Calculate score
  const questions = document.querySelectorAll('.question-card');
  let score = 0;

  questions.forEach(question => {
    if (question.querySelector('.correct-answer')) {
      score++;
    }
  });

  // Get quiz info
  const difficulty = document.querySelector('#difficulty').value;
  const subject = document.querySelector('#subject').value;

  // Send completion data to server and update daily quests
  fetch('/quiz_complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      score: score,
      total: questions.length,
      subject: subject,
      difficulty: difficulty
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Show completion notification
      ```javascript
      showToast(`Điểm của bạn: ${score}/${questions.length}`, 'info');

      // Show notifications for completed quests
      if (data.completed_quests && data.completed_quests.length > 0) {
        data.completed_quests.forEach(quest => {
          showToast(`Nhiệm vụ hoàn thành: ${quest}`, 'success');
        });
      }

      if (data.points_earned > 0) {
        showToast(`Nhận được ${data.points_earned} điểm nhiệm vụ!`, 'success');
      }

      if (data.xp_earned > 0) {
        showToast(`Nhận được ${data.xp_earned} điểm kinh nghiệm!`, 'success');
      }

      if (data.milestone_rewards > 0) {
        showToast(`Nhận được ${data.milestone_rewards} xu từ phần thưởng cột mốc!`, 'success');
      }

      // Update user stats in the UI
      updateUserStats(data);
    }

    // Show results section
    showQuizResults(score, questions.length);
  })
  .catch(error => {
    console.error('Error:', error);
    showToast('Có lỗi xảy ra khi hoàn thành bài quiz', 'danger');

    // Still show results even if there was an error updating quest progress
    showQuizResults(score, questions.length);
  });
}

// Show quiz results
function showQuizResults(score, total) {
  const quizContent = document.querySelector('#quiz-content');
  const resultsSection = document.querySelector('#quiz-results');

  if (!quizContent || !resultsSection) return;

  // Hide quiz content
  quizContent.classList.add('d-none');

  // Populate and show results section
  const scorePercentage = (score / total) * 100;
  let resultMessage = '';
  let resultClass = '';

  if (scorePercentage === 100) {
    resultMessage = 'Tuyệt vời! Bạn đã trả lời đúng tất cả câu hỏi!';
    resultClass = 'success';
  } else if (scorePercentage >= 70) {
    resultMessage = 'Tốt lắm! Bạn đã làm rất tốt.';
    resultClass = 'primary';
  } else if (scorePercentage >= 50) {
    resultMessage = 'Khá tốt! Hãy tiếp tục cố gắng.';
    resultClass = 'info';
  } else {
    resultMessage = 'Hãy cố gắng hơn! Bạn có thể làm tốt hơn lần sau.';
    resultClass = 'warning';
  }

  resultsSection.innerHTML = `
    <div class="card shadow">
      <div class="card-body text-center">
        <h3 class="mb-4">Kết quả Quiz</h3>
        <div class="result-circle mb-4 ${resultClass}">
          <span class="score">${score}/${total}</span>
          <span class="percentage">${scorePercentage}%</span>
        </div>
        <p class="result-message text-${resultClass} fw-bold">${resultMessage}</p>
        <div class="mt-4">
          <button id="retry-quiz" class="btn btn-primary me-2">Làm lại</button>
          <a href="/mainquiz" class="btn btn-secondary">Quay lại</a>
        </div>
      </div>
    </div>
  `;

  // Show results section
  resultsSection.classList.remove('d-none');

  // Add event listener to retry button
  const retryBtn = document.querySelector('#retry-quiz');
  if (retryBtn) {
    retryBtn.addEventListener('click', function() {
      // Hide results
      resultsSection.classList.add('d-none');

      // Show setup
      document.querySelector('#quiz-setup').classList.remove('d-none');
    });
  }
}

// Setup shop functionality
function setupShop() {
  const shopContainer = document.querySelector('.shop-container');
  if (!shopContainer) return;

  // Event delegation for buy buttons
  shopContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('buy-button') || e.target.closest('.buy-button')) {
      const button = e.target.classList.contains('buy-button') ? e.target : e.target.closest('.buy-button');
      const itemName = button.getAttribute('data-item');
      const itemCost = parseInt(button.getAttribute('data-cost'));

      // Check if user has enough coins
      const userCoins = parseInt(document.querySelector('.user-coins').textContent);

      if (userCoins < itemCost) {
        showToast('Bạn không đủ xu để mua vật phẩm này', 'warning');
        return;
      }

      // Confirm purchase
      if (confirm(`Xác nhận mua ${itemName} với giá ${itemCost} xu?`)) {
        purchaseItem(itemName, itemCost);
      }
    }
  });

  // Setup fortune cookie
  setupFortuneCookie();
}

// Purchase item
function purchaseItem(item, cost) {
  fetch('/api/purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      item: item,
      cost: cost
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showToast(`Đã mua thành công: ${item}`, 'success');

      // Update user coins
      document.querySelector('.user-coins').textContent = data.newBalance;

      // If this is a Gacha, show the gacha interface
      if (item === 'Gacha') {
        openGachaInterface();
      }
    } else {
      showToast(data.message, 'danger');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showToast('Có lỗi xảy ra khi mua hàng', 'danger');
  });
}

// Fortune cookie functionality
function setupFortuneCookie() {
  const cookieButton = document.querySelector('#open-fortune');
  if (!cookieButton) return;

  cookieButton.addEventListener('click', function() {
    openGachaInterface();
  });
}

// Open gacha interface
function openGachaInterface() {
  fetch('/api/gacha')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showGachaModal(data.rewards);
      } else {
        showToast(data.message, 'danger');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showToast('Có lỗi xảy ra khi mở bánh may mắn', 'danger');
    });
}

// Show gacha modal
function showGachaModal(rewards) {
  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="gachaModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Bánh may mắn</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="text-center mb-4">Hãy chọn một bánh may mắn để mở!</p>
            <div class="fortune-cookies-container">
              ${rewards.map((reward, index) => `
                <div class="fortune-cookie" data-index="${index}" data-reward='${JSON.stringify(reward)}'>
                  <img src="/static/images/fortune-cookies/cookie-closed.png" alt="Fortune Cookie">
                </div>
              `).join('')}
            </div>
            <div class="reward-container mt-4 d-none">
              <div class="text-center">
                <h4 class="reward-name"></h4>
                <p class="reward-description"></p>
                <p class="fortune-message"></p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to the page
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHtml;
  document.body.appendChild(modalContainer);

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById('gachaModal'));
  modal.show();

  // Add event listeners to cookies
  document.querySelectorAll('.fortune-cookie').forEach(cookie => {
    cookie.addEventListener('click', function() {
      const index = this.getAttribute('data-index');
      const reward = JSON.parse(this.getAttribute('data-reward'));

      // Show animation of opening cookie
      this.querySelector('img').src = '/static/images/fortune-cookies/cookie-open.png';

      // Show reward after a brief delay
      setTimeout(() => {
        document.querySelector('.reward-container').classList.remove('d-none');
        document.querySelector('.reward-name').textContent = reward.name;
        document.querySelector('.reward-description').textContent = reward.description;
        document.querySelector('.fortune-message').textContent = `"${reward.message}"`;

        // Disable clicking on other cookies
        document.querySelectorAll('.fortune-cookie').forEach(c => {
          c.style.opacity = '0.5';
          c.style.pointerEvents = 'none';
        });
        this.style.opacity = '1';

        // Send selected reward to server
        selectGachaReward(index, reward);
      }, 500);
    });
  });

  // Clean up modal when closed
  document.querySelector('#gachaModal').addEventListener('hidden.bs.modal', function() {
    document.body.removeChild(modalContainer);
  });
}

// Select gacha reward
function selectGachaReward(index, reward) {
  fetch('/api/gacha/select', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      index: index,
      reward: reward
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showToast(data.message, 'success');
    } else {
      showToast(data.message, 'danger');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showToast('Có lỗi xảy ra khi nhận phần thưởng', 'danger');
  });
}

// Setup advancements functionality
function setupAdvancements() {
  const achievementsContainer = document.querySelector('#achievementTabs');
  if (!achievementsContainer) return;

  // Add filter functionality
  const filterButtons = document.querySelectorAll('.achievement-filter button');
  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // Get filter value
        const filter = this.getAttribute('data-filter');

        // Apply filter
        const cards = document.querySelectorAll('.achievement-card');
        cards.forEach(card => {
          if (filter === 'all' || 
              (filter === 'achieved' && card.classList.contains('achieved')) ||
              (filter === 'unachieved' && !card.classList.contains('achieved'))) {
            card.closest('.col-md-4').style.display = 'block';
          } else {
            card.closest('.col-md-4').style.display = 'none';
          }
        });
      });
    });
  }

  // Explorer achievement tracking
  trackExplorerAchievement();
}

// Track explorer achievement
function trackExplorerAchievement() {
  // Create a set to track visited pages
  let visitedPages = new Set();

  // Add current page
  const currentPath = window.location.pathname;
  visitedPages.add(currentPath);

  // Retrieve existing visited pages from localStorage if available
  const storedPages = localStorage.getItem('visitedPages');
  if (storedPages) {
    try {
      const parsedPages = JSON.parse(storedPages);
      visitedPages = new Set([...visitedPages, ...parsedPages]);
    } catch (e) {
      console.error('Error parsing visited pages:', e);
    }
  }

  // Main pages to track
  const mainPages = [
    '/homepage',
    '/mainquiz',
    '/contribute',
    '/shop',
    '/inventory',
    '/advancements',
    '/daily-quests',
    '/event'
  ];

  // Save updated visited pages
  localStorage.setItem('visitedPages', JSON.stringify([...visitedPages]));

  // Check if all main pages have been visited
  const allVisited = mainPages.every(page => visitedPages.has(page));

  if (allVisited) {
    // Call API to complete explorer achievement
    fetch('/api/complete-explorer-achievement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.achieved) {
        showToast(`Đã đạt thành tựu: Nhà thám hiểm!`, 'success');
      }
    })
    .catch(error => console.error('Error completing explorer achievement:', error));
  }
}

// Update user stats in the UI
function updateUserStats(data) {
  // Update XP
  if (data.new_xp !== undefined) {
    const xpElements = document.querySelectorAll('.user-xp');
    xpElements.forEach(el => {
      el.textContent = data.new_xp;
    });
  }

  // Update coins
  if (data.new_coins !== undefined) {
    const coinElements = document.querySelectorAll('.user-coins');
    coinElements.forEach(el => {
      el.textContent = data.new_coins;
    });
  }

  // Update daily quest points
  if (data.daily_points !== undefined) {
    const dailyPointsElements = document.querySelectorAll('.daily-quest-points');
    dailyPointsElements.forEach(el => {
      el.textContent = data.daily_points;
    });

    // Update progress bar if exists
    const progressBar = document.querySelector('.progress-bar[aria-valuenow]');
    if (progressBar) {
      progressBar.style.width = `${(data.daily_points / 100) * 100}%`;
      progressBar.setAttribute('aria-valuenow', data.daily_points);
      progressBar.textContent = `${data.daily_points}/100`;
    }

    // Update milestone markers
    const milestones = document.querySelectorAll('.reward-milestone');
    if (milestones.length > 0) {
      milestones.forEach(milestone => {
        const milestoneValue = parseInt(milestone.getAttribute('data-milestone'));
        if (data.daily_points >= milestoneValue) {
          milestone.classList.add('milestone-reached');
        } else {
          milestone.classList.remove('milestone-reached');
        }
      });
    }
  }

  // Update quest status if quest_statuses provided
  if (data.quest_statuses) {
    const questsList = document.getElementById('questsList');
    if (questsList) {
      data.quest_statuses.forEach(quest => {
        const questCard = questsList.querySelector(`.quest-card[data-quest-id="${quest.id}"]`);
        if (questCard) {
          if (quest.completed) {
            questCard.classList.add('completed');
            const statusElement = questCard.querySelector('.quest-status');
            if (statusElement) {
              statusElement.innerHTML = '<span class="badge bg-success"><i class="fas fa-check-circle"></i> Hoàn thành</span>';
            }
          }
        }
      });
    }
  }
}

// Toast notification
function showToast(message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');

  // Create container if it doesn't exist
  if (!toastContainer) {
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
  }

  // Create toast
  const toastId = 'toast-' + Date.now();
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.setAttribute('id', toastId);

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  document.querySelector('.toast-container').appendChild(toast);

  // Initialize and show
  const bsToast = new bootstrap.Toast(toast, {
    animation: true,
    autohide: true,
    delay: 5000
  });

  bsToast.show();

  // Remove after hiding
  toast.addEventListener('hidden.bs.toast', function() {
    this.remove();
  });
}

// Hàm cập nhật tiến trình nhiệm vụ hàng ngày
function updateQuestProgress(data) {
  // Cập nhật thanh tiến trình
  const progressBar = document.querySelector('.progress-bar[aria-valuenow]');
  if (progressBar) {
    const questPoints = parseInt(progressBar.getAttribute('aria-valuenow'));
    progressBar.style.width = `${questPoints}%`;
    progressBar.textContent = `${questPoints}%`;

    // Cập nhật các milestone
    document.querySelectorAll('.reward-milestone').forEach(milestone => {
      const milestoneValue = parseInt(milestone.getAttribute('data-milestone') || '0');
      if (questPoints >= milestoneValue) {
        milestone.classList.add('active');
        milestone.classList.add('milestone-reached');
      }
    });
  }
}

// Nếu đang ở trang nhiệm vụ hàng ngày hoặc trang thành tựu, cập nhật tiến trình
if (window.location.pathname.includes('/daily-quests') || window.location.pathname.includes('/advancements')) {
  updateQuestProgress();
}

// Placeholder for updateQuestUI function -This function needs to be implemented to update the UI elements related to daily quests.  It's assumed to interact with elements on the `/daily-quests` page.

function updateQuestUI() {
  // Fetch updated quest data from the server
  fetch('/daily-quests/update')
    .then(response => response.json())
    .then(data => {
      if (data.updated) {
        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
          progressBar.style.width = `${data.progress}%`;
          progressBar.setAttribute('aria-valuenow', data.progress);
          progressBar.textContent = `${data.progress}%`;
        }

        // Update quest completion status
        data.completed_quests.forEach(quest => {
          const questElement = document.querySelector(`.quest-item[data-id="${quest.id}"]`);
          if (questElement) {
            if (quest.completed) {
              questElement.classList.add('completed');
              const statusElement = questElement.querySelector('.quest-status');
              if (statusElement) {
                statusElement.innerHTML = '<span class="badge bg-success"><i class="fas fa-check-circle"></i> Hoàn thành</span>';
              }
            }
          }
        });
        //Update Milestone
        data.milestones.forEach(milestone => {
          const milestoneElement = document.querySelector(`.milestone-item[data-id="${milestone.id}"]`);
          if(milestoneElement){
            if(milestone.isCompleted){
              milestoneElement.classList.add('completed');
            }
          }
        });
      } else {
        console.log('No quest updates available.');
      }
    })
    .catch(error => {
      console.error('Error updating quest UI:', error);
      showAlert('Lỗi cập nhật giao diện nhiệm vụ!', 'error');
    });
}

// Update user stats after completing quests or receiving rewards
function updateUserStats(data) {
  // Update user XP and coins in the navbar if available
  const userXP = document.querySelector('.user-xp');
  if (userXP && data.new_xp !== undefined) {
    userXP.textContent = data.new_xp;
  }

  const userCoins = document.querySelector('.user-coins');
  if (userCoins && data.new_coins !== undefined) {
    userCoins.textContent = data.new_coins;
  }

  // Update progress bar if on daily quests page
  const progressBar = document.querySelector('.progress-bar[aria-valuenow]');
  if (progressBar && data.daily_points !== undefined) {
    const newPoints = data.daily_points;
    progressBar.style.width = `${newPoints}%`;
    progressBar.setAttribute('aria-valuenow', newPoints);
    progressBar.textContent = `${newPoints}%`;

    // Update milestone indicators
    document.querySelectorAll('.reward-milestone').forEach(milestone => {
      const milestoneValue = parseInt(milestone.getAttribute('data-milestone') || '0');
      if (newPoints >= milestoneValue) {
        milestone.classList.add('active');
      } else {
        milestone.classList.remove('active');
      }
    });

    // Update points display
    const pointsDisplay = document.querySelector('.badge.bg-warning');
    if (pointsDisplay) {
      pointsDisplay.textContent = `Điểm: ${newPoints}/100`;
    }
  }
}

// Handle quest completion in quiz
document.addEventListener('quizComplete', function(e) {
  const data = e.detail;
  updateUserStats(data);

  if (data.points_earned > 0) {
    // Show a notification for each completed quest
    data.completed_quests.forEach(quest => {
      showToast(`Nhiệm vụ hoàn thành: ${quest}`, 'success');
    });

    // Show XP and coin rewards
    if (data.xp_earned > 0) {
      showToast(`Nhận được ${data.xp_earned} điểm kinh nghiệm!`, 'success');
    }

    if (data.milestone_rewards > 0) {
      showToast(`Nhận được ${data.milestone_rewards} xu từ phần thưởng!`, 'success');
    }
  }
});

// Theo dõi các trang đã truy cập để đạt thành tựu Nhà thám hiểm
let visitedPages = new Set();

// Ghi lại trang hiện tại vào danh sách đã truy cập
function trackPageVisit() {
    // Lấy đường dẫn hiện tại
    const currentPath = window.location.pathname;

    // Thêm vào danh sách các trang đã truy cập
    visitedPages.add(currentPath);

    // Lưu danh sách vào localStorage
    localStorage.setItem('visitedPages', JSON.stringify(Array.from(visitedPages)));

    // Kiểm tra điều kiện thành tựu Nhà thám hiểm
    checkExplorerAchievement();
}

// Kiểm tra thành tựu Nhà thám hiểm
function checkExplorerAchievement() {
    // Danh sách các trang chính trong ứng dụng
    const mainPages = ['/homepage', '/mainquiz', '/contribute', '/shop', '/inventory', '/advancements', '/daily-quests', '/event'];

    // Lấy danh sách các trang đã truy cập từ localStorage
    const storedPages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
    visitedPages = new Set(storedPages);

    // Thêm trang hiện tại
    visitedPages.add(window.location.pathname);

    // Hiển thị thông tin truy cập
    console.log('Đã truy cập các trang:', Array.from(visitedPages));
    console.log('Cần truy cập các trang:', mainPages);

    // Kiểm tra xem đã truy cập đủ 3 trang chưa
    let visitedCount = 0;

    for (const page of mainPages) {
        for (const visited of visitedPages) {
            if (visited === page || visited.startsWith(page + '?')) {
                visitedCount++;
                break;
            }
        }
    }

    console.log(`Đã truy cập ${visitedCount}/${mainPages.length} trang`);

    // Nếu đã truy cập đủ 3 trang, gửi request để nhận thành tựu
    if (visitedCount >= 3) {
        console.log('Đã truy cập đủ 3 trang, gửi request nhận thành tựu');

        // Gửi request để cập nhật thành tựu
        fetch('/api/complete-explorer-achievement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            console.log('Kết quả thành tựu:', data);

            if (data.success && data.achieved) {
                showToast(`🏆 Đã đạt thành tựu: Nhà thám hiểm! Nhận được ${data.reward_coins} xu và ${data.reward_xp} XP`, 'success', 5000);

                // Cập nhật UI
                updateBalanceDisplay();
            }
        })
        .catch(error => {
            console.error('Lỗi khi nhận thành tựu:', error);
        });
    }
}

// Cập nhật tiến độ nhiệm vụ hàng ngày
function updateQuestProgress() {
    // Lấy tiến độ nhiệm vụ hàng ngày nếu đang ở trang nhiệm vụ
    if (window.location.pathname === '/daily-quests') {
        fetch('/quiz_complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'refresh'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Cập nhật thanh tiến độ
                const progressBar = document.getElementById('daily-quest-progress');
                if (progressBar) {
                    progressBar.style.width = `${data.daily_points}%`;
                    progressBar.setAttribute('aria-valuenow', data.daily_points);
                    document.getElementById('progress-text').textContent = `${data.daily_points}%`;
                }

                // Cập nhật trạng thái các nhiệm vụ
                if (data.quest_statuses) {
                    data.quest_statuses.forEach(quest => {
                        const questEl = document.querySelector(`.quest-item[data-quest-id="${quest.id}"]`);
                        if (questEl) {
                            if (quest.completed) {
                                questEl.classList.add('completed');
                                questEl.querySelector('.quest-status').innerHTML = '<i class="fas fa-check-circle text-success"></i>';
                            } else {
                                questEl.classList.remove('completed');
                                questEl.querySelector('.quest-status').innerHTML = '<i class="fas fa-circle text-secondary"></i>';
                            }
                        }
                    });
                }
            }
        })
        .catch(error => {
            console.error('Lỗi khi cập nhật tiến độ nhiệm vụ:', error);
        });
    }
}

// Cập nhật UI hiển thị nhiệm vụ
function updateQuestUI() {
    fetch('/quiz_complete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'refresh'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Cập nhật thanh tiến độ nếu có
            const progressBar = document.getElementById('daily-quest-progress');
            if (progressBar) {
                progressBar.style.width = `${data.daily_points}%`;
                progressBar.setAttribute('aria-valuenow', data.daily_points);
                const progressText = document.getElementById('progress-text');
                if (progressText) {
                    progressText.textContent = `${data.daily_points}%`;
                }
            }

            // Cập nhật trạng thái nhiệm vụ nếu có
            if (data.quest_statuses) {
                data.quest_statuses.forEach(quest => {
                    const questEl = document.querySelector(`.quest-item[data-quest-id="${quest.id}"]`);
                    if (questEl) {
                        if (quest.completed) {
                            questEl.classList.add('completed');
                            const statusEl = questEl.querySelector('.quest-status');
                            if (statusEl) {
                                statusEl.innerHTML = '<i class="fas fa-check-circle text-success"></i>';
                            }
                        }
                    }
                });
            }
        }
    })
    .catch(error => {
        console.error('Lỗi khi cập nhật UI nhiệm vụ:', error);
    });
}

// Kiểm tra các thành tựu mới
function checkAchievements() {
    fetch('/api/check-achievements')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.new_achievements && data.new_achievements.length > 0) {
            data.new_achievements.forEach(achievement => {
                let rewardText = '';
                if (achievement.xp_reward > 0) {
                    rewardText += `${achievement.xp_reward} XP`;
                }
                if (achievement.coin_reward > 0) {
                    if (rewardText) rewardText += ' và ';
                    rewardText += `${achievement.coin_reward} xu`;
                }

                showToast(`🏆 Đã đạt thành tựu: ${achievement.name}! Nhận được ${rewardText}`, 'success', 5000);
            });
        }
    })
    .catch(error => {
        console.error('Lỗi khi kiểm tra thành tựu:', error);
    });
}

// Hiển thị thông báo
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1050';
        document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.getElementById('toast-container').appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: duration
    });

    toast.show();

    // Tự động xóa phần tử sau khi ẩn
    toastEl.addEventListener('hidden.bs.toast', function () {
        toastEl.remove();
    });
}

// Cập nhật giá trị xu hiển thị
function updateBalanceDisplay() {
    const coinDisplay = document.getElementById('user-coins');
    if (coinDisplay) {
        fetch('/quiz_complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'refresh'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                coinDisplay.textContent = data.new_coins;
            }
        })
        .catch(error => {
            console.error('Lỗi khi cập nhật xu:', error);
        });
    }
}

// Xử lý khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo danh sách các trang đã truy cập từ localStorage
    const storedPages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
    visitedPages = new Set(storedPages);

    // Ghi lại trang hiện tại
    trackPageVisit();

    // Kiểm tra thành tựu định kỳ
    checkAchievements();

    // Cập nhật tiến độ nhiệm vụ
    updateQuestProgress();

    // Xử lý việc truy cập cửa hàng (shop) cho nhiệm vụ hằng ngày
    const currentPath = window.location.pathname;

    // Nếu đang ở trang shop, gửi thông báo để cập nhật nhiệm vụ hằng ngày
    if (currentPath === '/shop') {
        fetch('/quiz_complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject: 'shop_visit'
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Shop visit quest data:', data);

            if (data.completed_quests && data.completed_quests.length > 0) {
                // Hiển thị thông báo nếu có nhiệm vụ nào được hoàn thành
                showToast('Nhiệm vụ hoàn thành!', 'success');

                // Hiển thị thông báo với chi tiết phần thưởng
                if (data.coin_rewards > 0 || data.xp_earned > 0) {
                    let rewardMessage = 'Bạn nhận được ';
                    if (data.coin_rewards > 0) {
                        rewardMessage += data.coin_rewards + ' xu';
                    }
                    if (data.xp_earned > 0) {
                        rewardMessage += (data.coin_rewards > 0 ? ' và ' : '') + data.xp_earned + ' XP';
                    }
                    showToast(rewardMessage, 'success', 5000);
                }

                // Cập nhật UI nhiệm vụ nếu đang ở trang nhiệm vụ
                updateQuestUI();
            }
        })
        .catch(error => {
            console.error('Error updating shop visit quest:', error);
        });
    }

    // Cập nhật UI cho trang nhiệm vụ hàng ngày nếu đang ở trang đó
    if (currentPath === '/daily-quests') {
        updateQuestUI();
    }

    // Initialize tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

// Track visited pages for Explorer achievement
let visitedPages = new Set();

// Add current page to visited list if not already there
function trackPageVisit() {
    const currentPath = window.location.pathname;
    visitedPages.add(currentPath);
    localStorage.setItem('visitedPages', JSON.stringify(Array.from(visitedPages)));

    // Danh sách các trang chính trên thanh điều hướng
    const requiredPaths = ['/homepage', '/contribute', '/shop', '/mainquiz', '/inventory', '/advancements', '/event', '/daily-quests'];

    // Kiểm tra xem người dùng đã ghé thăm tối thiểu 3/8 trang chính chưa
    let visitedCount = 0;
    for (const path of requiredPaths) {
        if (visitedPages.has(path)) {
            visitedCount++;
        }
    }

    // Nếu đã ghé thăm đủ số trang tối thiểu (3/8)
    if (visitedCount >= 3) {
        // Gọi API để trao thành tựu nhà thám hiểm
        fetch('/api/complete-explorer-achievement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ visited_pages: Array.from(visitedPages) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.achieved) {
                showAchievementToast(
                    `Thành tựu: ${data.message}`,
                    `Phần thưởng: ${data.reward_xp} XP, ${data.reward_coins} xu`
                );
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function showAchievementToast(title, message) {
    showToast(`${title}! ${message}`, 'success', 5000);
}

// Quiz Management
function setupQuiz() {
    const quizModal = document.getElementById('quizModal');
    if (quizModal) {
        const modal = new bootstrap.Modal(quizModal);
    }
}

function startQuiz(subject, difficulty) {
    const entranceFees = {
        'easy': 10,
        'medium': 25,
        'hard': 50
    };

    const rewards = {
        'easy': 5,
        'medium': 10,
        'hard': 15
    };

    if (confirm(`Start ${difficulty} ${subject} quiz? Entry fee: ${entranceFees[difficulty]} coins`)) {
        loadQuestions(subject, difficulty);
    }
}

let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

async function loadQuestions(subject, difficulty) {
    try {
        showLoadingSpinner();

        // Simulate API call to get questions
        // In production, this would be a real API call
        const response = await fetch(`/api/questions?subject=${subject}&difficulty=${difficulty}`);
        const questions = await response.json();

        currentQuestions = questions;
        currentQuestionIndex = 0;
        score = 0;

        showQuestion();
        hideLoadingSpinner();

    } catch (error) {
        console.error('Error loading questions:', error);
        hideLoadingSpinner();
        showError('Failed to load questions. Please try again.');
    }
}

function showQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    const question = currentQuestions[currentQuestionIndex];

    if (!question) {
        endQuiz();
        return;
    }

    const optionsHtml = ['A', 'B', 'C', 'D'].map(letter => `
        <button class="option-button option-item" onclick="selectAnswer('${letter}')">
            ${letter}. ${question['option_' + letter.toLowerCase()]}
        </button>
    `).join('');

    questionContainer.innerHTML = `
        <h4 class="mb-4">${question.question_text}</h4>
        <div class="options-container">
            ${optionsHtml}
        </div>
    `;
}

function selectAnswer(answer) {
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = answer === question.correct_answer;

    // Highlight correct/incorrect answer
    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent.startsWith(answer)) {
            button.classList.add(isCorrect ? 'btn-success' : 'btn-danger');
        }
        if (button.textContent.startsWith(question.correct_answer)) {
            button.classList.add('btn-success');
        }
    });

    if (isCorrect) {
        score++;
    }

    // Show next question after delay
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 1500);
}

function endQuiz() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('quizModal'));
    modal.hide();

    showResult();
}

function showResult() {
    const totalQuestions = currentQuestions.length;
    const percentage = (score / totalQuestions) * 100;

    Swal.fire({
        title: 'Quiz Complete!',
        html: `
            <p>You scored ${score} out of ${totalQuestions}</p>
            <p>Percentage: ${percentage.toFixed(1)}%</p>
        `,
        icon: percentage >= 70 ? 'success' : 'info',
        confirmButtonText: 'OK'
    });
}

// UI Helpers
function showLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    document.body.appendChild(spinner);
}

function hideLoadingSpinner() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

function showError(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

// Shop Functionality
function purchaseItem(itemName, cost) {
    Swal.fire({
        title: 'Confirm Purchase',
        text: `Do you want to purchase ${itemName} for ${cost} coins?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            // Send purchase request to server
            fetch('/api/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item: itemName,
                    cost: cost
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('Success', 'Item purchased successfully!', 'success');
                    // Update user's coin balance
                    updateUserCoins(data.newBalance);
                } else {
                    Swal.fire('Error', data.message || 'Purchase failed', 'error');
                }
            })
            .catch(error => {
                console.error('Purchase error:', error);
                Swal.fire('Error', 'Failed to process purchase', 'error');
            });
        }
    });
}


// Show alert helper using SweetAlert2
function showAlert3(message, type) {
    const icon = type === 'error' ? 'error' : 'success';
    Swal.fire({
        title: type === 'error' ? 'Lỗi!' : 'Thành công!',
        text: message,
        icon: icon,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
    });
}

// Number counter animation
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Initialize AOS
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Setup Quiz functionality
    setupQuiz();
});

// Auto-refresh admin dashboard stats
function refreshDashboardStats() {
  if (window.location.pathname.includes('/admin/dashboard')) {
    fetch('/admin/dashboard', { 
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Update stats
      const statElements = document.querySelectorAll('.stat-number');
      const newStatElements = doc.querySelectorAll('.stat-number');

      console.log("Current stats elements:", statElements.length);
      console.log("New stats elements:", newStatElements.length);

      for (let i = 0; i < statElements.length; i++) {
        if (newStatElements[i] && statElements[i]) {
          console.log(`Updating stat ${i}:`, newStatElements[i].textContent);
          // Cập nhật trực tiếp nội dung
          statElements[i].textContent = newStatElements[i].textContent;

          // Apply highlight effect
          statElements[i].classList.remove('highlight-update');
          // Force reflow
          void statElements[i].offsetWidth;
          statElements[i].classList.add('highlight-update');
        }
      }
    })
    .catch(error => console.error('Error refreshing stats:', error));
    .catch(error => console.error('Error refreshing stats:', error));
  }
}

// Auto-refresh every 10 seconds
setInterval(refreshDashboardStats, 10000);

// Show toast notifications
function showToast(message, type = 'info', duration = 3000) {
  // Create toast element if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }

  const toastId = 'toast-' + Date.now();
  const toast = document.createElement('div');
  toast.className = `toast show bg-${type} text-white`;
  toast.id = toastId;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="toast-header bg-${type} text-white">
      <strong class="me-auto">Thông báo</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;

  toastContainer.appendChild(toast);

  // Auto hide after specified duration
  setTimeout(() => {
    toast.remove();
  }, duration);
}

// Update quest progress visual indicators
function updateQuestProgress() {
  // Cập nhật thanh tiến trình
  const progressBar = document.querySelector('.progress-bar[aria-valuenow]');
  if (progressBar) {
    const questPoints = parseInt(progressBar.getAttribute('aria-valuenow'));
    progressBar.style.width = `${questPoints}%`;
    progressBar.textContent = `${questPoints}%`;

    // Cập nhật các milestone
    document.querySelectorAll('.reward-milestone').forEach(milestone => {
      const milestoneValue = parseInt(milestone.getAttribute('data-milestone') || '0');
      if (questPoints >= milestoneValue) {
        milestone.classList.add('active');
        milestone.classList.add('milestone-reached');
      }
    });
  }
}

// Update user stats after completing quests or receiving rewards
function updateUserStats(data) {
  // Update user XP and coins in the navbar if available
  const userXP = document.querySelector('.user-xp');
  if (userXP && data.new_xp !== undefined) {
    userXP.textContent = data.new_xp;
  }

  const userCoins = document.querySelector('.user-coins');
  if (userCoins && data.new_coins !== undefined) {
    userCoins.textContent = data.new_coins;
  }

  // Update progress bar if on daily quests page
  const progressBar = document.querySelector('.progress-bar[aria-valuenow]');
  if (progressBar && data.daily_points !== undefined) {
    const newPoints = data.daily_points;
    progressBar.style.width = `${newPoints}%`;
    progressBar.setAttribute('aria-valuenow', newPoints);
    progressBar.textContent = `${newPoints}%`;

    // Update milestone indicators
    document.querySelectorAll('.reward-milestone').forEach(milestone => {
      const milestoneValue = parseInt(milestone.getAttribute('data-milestone') || '0');
      if (newPoints >= milestoneValue) {
        milestone.classList.add('active');
      } else {
        milestone.classList.remove('active');
      }
    });

    // Update points display
    const pointsDisplay = document.querySelector('.badge.bg-warning');
    if (pointsDisplay) {
      pointsDisplay.textContent = `Điểm: ${newPoints}/100`;
    }
  }
}

// Handle quest completion in quiz
document.addEventListener('quizComplete', function(e) {
  const data = e.detail;
  updateUserStats(data);

  if (data.points_earned > 0) {
    // Show a notification for each completed quest
    data.completed_quests.forEach(quest => {
      showToast(`Nhiệm vụ hoàn thành: ${quest}`, 'success');
    });

    // Show XP and coin rewards
    if (data.xp_earned > 0) {
      showToast(`Nhận được ${data.xp_earned} điểm kinh nghiệm!`, 'success');
    }

    if (data.milestone_rewards > 0) {
      showToast(`Nhận được ${data.milestone_rewards} xu từ phần thưởng!`, 'success');
    }
  }
});

// Theo dõi các trang đã truy cập để đạt thành tựu Nhà thám hiểm
let visitedPages = new Set();

// Ghi lại trang hiện tại vào danh sách đã truy cập
function trackPageVisit() {
    // Lấy đường dẫn hiện tại
    const currentPath = window.location.pathname;

    // Thêm vào danh sách các trang đã truy cập
    visitedPages.add(currentPath);

    // Lưu danh sách vào localStorage
    localStorage.setItem('visitedPages', JSON.stringify(Array.from(visitedPages)));

    // Kiểm tra điều kiện thành tựu Nhà thám hiểm
    checkExplorerAchievement();
}

// Kiểm tra thành tựu Nhà thám hiểm
function checkExplorerAchievement() {
    // Danh sách các trang chính trong ứng dụng
    const mainPages = ['/homepage', '/mainquiz', '/contribute', '/shop', '/inventory', '/advancements', '/daily-quests', '/event'];

    // Lấy danh sách các trang đã truy cập từ localStorage
    const storedPages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
    visitedPages = new Set(storedPages);

    // Thêm trang hiện tại
    visitedPages.add(window.location.pathname);

    // Hiển thị thông tin truy cập
    console.log('Đã truy cập các trang:', Array.from(visitedPages));
    console.log('Cần truy cập các trang:', mainPages);

    // Kiểm tra xem đã truy cập đủ 3 trang chưa
    let visitedCount = 0;

    for (const page of mainPages) {
        for (const visited of visitedPages) {
            if (visited === page || visited.startsWith(page + '?')) {
                visitedCount++;
                break;
            }
        }
    }

    console.log(`Đã truy cập ${visitedCount}/${mainPages.length} trang`);

    // Nếu đã truy cập đủ 3 trang, gửi request để nhận thành tựu
    if (visitedCount >= 3) {
        console.log('Đã truy cập đủ 3 trang, gửi request nhận thành tựu');

        // Gửi request để cập nhật thành tựu
        fetch('/api/complete-explorer-achievement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            console.log('Kết quả thành tựu:', data);

            if (data.success && data.achieved) {
                showToast(`🏆 Đã đạt thành tựu: Nhà thám hiểm! Nhận được ${data.reward_coins} xu và ${data.reward_xp} XP`, 'success', 5000);

                // Cập nhật UI
                updateBalanceDisplay();
            }
        })
        .catch(error => {
            console.error('Lỗi khi nhận thành tựu:', error);
        });
    }
}

// Cập nhật tiến độ nhiệm vụ hàng ngày
function updateQuestProgress() {
    // Lấy tiến độ nhiệm vụ hàng ngày nếu đang ở trang nhiệm vụ
    if (window.location.pathname === '/daily-quests') {
        fetch('/quiz_complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'refresh'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Cập nhật thanh tiến độ
                const progressBar = document.getElementById('daily-quest-progress');
                if (progressBar) {
                    progressBar.style.width = `${data.daily_points}%`;
                    progressBar.setAttribute('aria-valuenow', data.daily_points);
                    document.getElementById('progress-text').textContent = `${data.daily_points}%`;
                }

                // Cập nhật trạng thái các nhiệm vụ
                if (data.quest_statuses) {
                    data.quest_statuses.forEach(quest => {
                        const questEl = document.querySelector(`.quest-item[data-quest-id="${quest.id}"]`);
                        if (questEl) {
                            if (quest.completed) {
                                questEl.classList.add('completed');
                                questEl.querySelector('.quest-status').innerHTML = '<i class="fas fa-check-circle text-success"></i>';
                            } else {
                                questEl.classList.remove('completed');
                                questEl.querySelector('.quest-status').innerHTML = '<i class="fas fa-circle text-secondary"></i>';
                            }
                        }
                    });
                }
            }
        })
        .catch(error => {
            console.error('Lỗi khi cập nhật tiến độ nhiệm vụ:', error);
        });
    }
}

// Cập nhật UI hiển thị nhiệm vụ
function updateQuestUI() {
    fetch('/quiz_complete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'refresh'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Cập nhật thanh tiến độ nếu có
            const progressBar = document.getElementById('daily-quest-progress');
            if (progressBar) {
                progressBar.style.width = `${data.daily_points}%`;
                progressBar.setAttribute('aria-valuenow', data.daily_points);
                const progressText = document.getElementById('progress-text');
                if (progressText) {
                    progressText.textContent = `${data.daily_points}%`;
                }
            }

            // Cập nhật trạng thái nhiệm vụ nếu có
            if (data.quest_statuses) {
                data.quest_statuses.forEach(quest => {
                    const questEl = document.querySelector(`.quest-item[data-quest-id="${quest.id}"]`);
                    if (questEl) {
                        if (quest.completed) {
                            questEl.classList.add('completed');
                            const statusEl = questEl.querySelector('.quest-status');
                            if (statusEl) {
                                statusEl.innerHTML = '<i class="fas fa-check-circle text-success"></i>';
                            }
                        }
                    }
                });
            }
        }
    })
    .catch(error => {
        console.error('Lỗi khi cập nhật UI nhiệm vụ:', error);
    });
}

// Kiểm tra các thành tựu mới
function checkAchievements() {
    fetch('/api/check-achievements')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.new_achievements && data.new_achievements.length > 0) {
            data.new_achievements.forEach(achievement => {
                let rewardText = '';
                if (achievement.xp_reward > 0) {
                    rewardText += `${achievement.xp_reward} XP`;
                }
                if (achievement.coin_reward > 0) {
                    if (rewardText) rewardText += ' và ';
                    rewardText += `${achievement.coin_reward} xu`;
                }

                showToast(`🏆 Đã đạt thành tựu: ${achievement.name}! Nhận được ${rewardText}`, 'success', 5000);
            });
        }
    })
    .catch(error => {
        console.error('Lỗi khi kiểm tra thành tựu:', error);
    });
}

// Hiển thị thông báo
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1050';
        document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.getElementById('toast-container').appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: duration
    });

    toast.show();

    // Tự động xóa phần tử sau khi ẩn
    toastEl.addEventListener('hidden.bs.toast', function () {
        toastEl.remove();
    });
}

// Cập nhật giá trị xu hiển thị
function updateBalanceDisplay() {
    const coinDisplay = document.getElementById('user-coins');
    if (coinDisplay) {
        fetch('/quiz_complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'refresh'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                coinDisplay.textContent = data.new_coins;
            }
        })
        .catch(error => {
            console.error('Lỗi khi cập nhật xu:', error);
        });
    }
}

// Xử lý khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo danh sách các trang đã truy cập từ localStorage
    const storedPages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
    visitedPages = new Set(storedPages);

    // Ghi lại trang hiện tại
    trackPageVisit();

    // Kiểm tra thành tựu định kỳ
    checkAchievements();

    // Cập nhật tiến độ nhiệm vụ
    updateQuestProgress();

    // Xử lý việc truy cập cửa hàng (shop) cho nhiệm vụ hằng ngày
    const currentPath = window.location.pathname;

    // Nếu đang ở trang shop, gửi thông báo để cập nhật nhiệm vụ hằng ngày
    if (currentPath === '/shop') {
        fetch('/quiz_complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject: 'shop_visit'
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Shop visit quest data:', data);

            if (data.completed_quests && data.completed_quests.length > 0) {
                // Hiển thị thông báo nếu có nhiệm vụ nào được hoàn thành
                showToast('Nhiệm vụ hoàn thành!', 'success');

                // Hiển thị thông báo với chi tiết phần thưởng
                if (data.coin_rewards > 0 || data.xp_earned > 0) {
                    let rewardMessage = 'Bạn nhận được ';
                    if (data.coin_rewards > 0) {
                        rewardMessage += data.coin_rewards + ' xu';
                    }
                    if (data.xp_earned > 0) {
                        rewardMessage += (data.coin_rewards > 0 ? ' và ' : '') + data.xp_earned + ' XP';
                    }
                    showToast(rewardMessage, 'success', 5000);
                }

                // Cập nhật UI nhiệm vụ nếu đang ở trang nhiệm vụ
                updateQuestUI();
            }
        })
        .catch(error => {
            console.error('Error updating shop visit quest:', error);
        });
    }

    // Cập nhật UI cho trang nhiệm vụ hàng ngày nếu đang ở trang đó
    if (currentPath === '/daily-quests') {
        updateQuestUI();
    }

    // Initialize tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

// Track visited pages for Explorer achievement
let visitedPages = new Set();

// Add current page to visited list if not already there
function trackPageVisit() {
    const currentPath = window.location.pathname;
    visitedPages.add(currentPath);
    localStorage.setItem('visitedPages', JSON.stringify(Array.from(visitedPages)));

    // Danh sách các trang chính trên thanh điều hướng
    const requiredPaths = ['/homepage', '/contribute', '/shop', '/mainquiz', '/inventory', '/advancements', '/event', '/daily-quests'];

    // Kiểm tra xem người dùng đã ghé thăm tối thiểu 3/8 trang chính chưa
    let visitedCount = 0;
    for (const path of requiredPaths) {
        if (visitedPages.has(path)) {
            visitedCount++;
        }
    }

    // Nếu đã ghé thăm đủ số trang tối thiểu (3/8)
    if (visitedCount >= 3) {
        // Gọi API để trao thành tựu nhà thám hiểm
        fetch('/api/complete-explorer-achievement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ visited_pages: Array.from(visitedPages) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.achieved) {
                showAchievementToast(
                    `Thành tựu: ${data.message}`,
                    `Phần thưởng: ${data.reward_xp} XP, ${data.reward_coins} xu`
                );
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

function showAchievementToast(title, message) {
    showToast(`${title}! ${message}`, 'success', 5000);
}