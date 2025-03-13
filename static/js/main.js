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
                    showMilestoneTooltip(this, `Milestone ${points} points reached!`);
                } else {
                    const points = this.getAttribute('data-milestone');
                    showMilestoneTooltip(this, `Need ${points} points to claim reward`);
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
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        // Initialize tooltips only if not already initialized
        if (typeof tooltipList === 'undefined') {
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

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
              showToast(`Quest completed: ${quest}`, 'success');
            });

            // Show rewards
            if (data.points_earned > 0) {
              showToast(`Received ${data.points_earned} quest points!`, 'success');
            }

            if (data.xp_earned > 0) {
              showToast(`Received ${data.xp_earned} XP!`, 'success');
            }

            if (data.milestone_rewards > 0) {
              showToast(`Received ${data.milestone_rewards} coins from milestone rewards!`, 'success');
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

        if (questDescription.includes('Visit Shop')) {
          // Update UI immediately for better user experience
          const badge = questItem.querySelector('.badge');
          if (badge) {
            badge.classList.remove('bg-secondary');
            badge.classList.add('bg-success');
            badge.innerHTML = '<i class="fas fa-check"></i>';
          }

          this.textContent = 'Completed';
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
                showToast('Quest completed!', 'success');

                // Hiển thị thông báo với chi tiết phần thưởng
                if (data.coin_rewards > 0 || data.xp_earned > 0) {
                    let rewardMessage = 'You received ';
                    if (data.coin_rewards > 0) {
                        rewardMessage += data.coin_rewards + ' xu';
                    }
                    if (data.xp_earned > 0) {
                        rewardMessage += (data.coin_rewards > 0 ? ' and ' : '') + data.xp_earned + ' XP';
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

    // Kiểm tra thành tựu định kỳ (nếu hàm này tồn tại)
    if (typeof checkAchievements === 'function') {
        checkAchievements();
    }

    // Refresh stats immediately when page loads
    refreshDashboardStats();

    // Set up auto-refresh if on admin dashboard
    if (window.location.pathname.includes('/admin/dashboard')) {
        console.log('Dashboard detected, setting up auto-refresh');
        setInterval(refreshDashboardStats, 5000); // Refresh more frequently (every 5 seconds)
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
            confirmButtonText: 'Close'
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
        title: type === 'error' ? 'Error!' : 'Success!',
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
          data.new_achievements.forEach((achievement, index) => {
            setTimeout(() => {
              showAchievementNotification(achievement);
            }, index * 3000); // Show each achievement 3 seconds apart
          });
          setTimeout(() => {
            window.location.reload();
          }, (data.new_achievements.length * 3000) + 2000); //refresh after all notifications
        }
      })
      .catch(error => console.error('Error checking achievements:', error));
  }
}

// Show achievement notification
function showAchievementNotification(achievement) {
  const notificationHtml = `
    <div class="achievement-toast">
      <div class="achievement-toast-icon">
        <i class="fas fa-trophy"></i>
      </div>
      <div class="achievement-toast-content">
        <h5>Thành tựu mới!</h5>
        <p><strong>${achievement.name}</strong></p>
        <p>${achievement.description}</p>
        <div class="achievement-rewards">
          ${achievement.xp_reward > 0 ? `<span class="badge bg-primary">+${achievement.xp_reward} XP</span>` : ''}
          ${achievement.coin_reward > 0 ? `<span class="badge bg-warning text-dark">+${achievement.coin_reward} Coins</span>` : ''}
          ${achievement.item_reward ? `<span class="badge bg-success">+${achievement.item_reward}</span>` : ''}
        </div>
      </div>
    </div>
  `;

  const notification = document.createElement('div');
  notification.className = 'achievement-toast';
  notification.innerHTML = notificationHtml;
  document.body.appendChild(notification);

  // Play sound effect if available
  const sound = new Audio('/static/sounds/achievement.mp3');
  sound.volume = 0.5;
  sound.play().catch(e => console.log('Sound could not be played'));

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
        showToast('Please select subject and difficulty', 'warning');
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
        showToast('Error loading questions', 'danger');
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
          <h5 class="m-0">Question ${index + 1}</h5>
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
    <button id="finish-quiz" class="btn btn-primary btn-lg">Finish Quiz</button>
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
          <i class="fas fa-check-circle"></i> Correct! 
          ${data.xp_gained ? `<span class="badge bg-primary">+${data.xp_gained} XP</span>` : ''}
          ${data.coins_gained ? `<span class="badge bg-warning text-dark">+${data.coins_gained} Coins</span>` : ''}
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
        showToast(`Congratulations! You ranked up to ${data.new_rank}!`, 'success');
      }

    } else {
      resultFeedback.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-times-circle"></i> Incorrect! Correct answer is: ${data.correct_answer}
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
    showToast('Error submitting answer', 'danger');
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
      showToast(`Your score: ${score}/${questions.length}`, 'info');

      // Show notifications for completed quests
      if (data.completed_quests && data.completed_quests.length > 0) {
        data.completed_quests.forEach(quest => {
          showToast(`Quest completed: ${quest}`, 'success');
        });
      }

      if (data.points_earned > 0) {
        showToast(`Received ${data.points_earned} quest points!`, 'success');
      }

      if (data.xp_earned > 0) {
        showToast(`Received ${data.xp_earned} XP!`, 'success');
      }

      if (data.milestone_rewards > 0) {
        showToast(`Received ${data.milestone_rewards} coins from milestonerewards!`, 'success');
      }

      // Update user stats in the UI
      updateUserStats(data);
    }

    // Show results section
    showQuizResults(score, questions.length);
  })
  .catch(error => {
    console.error('Error:', error);
    showToast('Error finishing quiz', 'danger');

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
    resultMessage = 'Excellent! You answered all questions correctly!';
    resultClass = 'success';
  } else if (scorePercentage >= 70) {
    resultMessage = 'Great job! You did very well.';
    resultClass = 'primary';
  } else if (scorePercentage >= 50) {
    resultMessage = 'Good! Keep practicing.';
    resultClass = 'info';
  } else {
    resultMessage = 'Keep trying! You can do better next time.';
    resultClass = 'warning';
  }

  resultsSection.innerHTML = `
    <div class="card shadow">
      <div class="card-body text-center">
        <h3 class="mb-4">Quiz Results</h3>
        <div class="result-circle mb-4 ${resultClass}">
          <span class="score">${score}/${total}</span>
          <span class="percentage">${scorePercentage}%</span>
        </div>
        <p class="result-message text-${resultClass} fw-bold">${resultMessage}</p>
        <div class="mt-4">
          <button id="retry-quiz" class="btn btn-primary me-2">Retry Quiz</button>
          <a href="/mainquiz" class="btn btn-secondary">Go Back</a>
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
        showToast('You do not have enough coins to buy this item', 'warning');
        return;
      }

      // Confirm purchase
      if (confirm(`Confirm purchase of ${itemName} for ${itemCost} coins?`)) {
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
      showToast(`Successfully purchased: ${item}`, 'success');

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
    showToast('Error purchasing item', 'danger');
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
      showToast('Error opening fortune cookie', 'danger');
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
            <h5 class="modal-title">Fortune Cookie</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="text-center mb-4">Choose a fortune cookie to open!</p>
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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
  .catch(error => console.error('Error:', error));
}

// Kiểm tra thành tựu sau khi đăng nhập
document.addEventListener('DOMContentLoaded', function() {
  // Nếu người dùng đã đăng nhập, kiểm tra thành tựu
  if (document.body.classList.contains('logged-in')) {
    checkAchievements();
  }
});

// Hàm kiểm tra thành tựu
function checkAchievements() {
  fetch('/api/check-achievements')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.new_achievements.length > 0) {
        data.new_achievements.forEach(achievement => {
          showAchievementNotification(achievement);
        });
      }
    })
    .catch(error => console.error('Error checking achievements:', error));
}

// Hiển thị thông báo thành tựu mới
function showAchievementNotification(achievement) {
  const achievementHtml = `
    <div class="achievement-notification">
      <div class="achievement-icon">
        <img src="/static/images/icons/${achievement.icon}" alt="${achievement.name}" onerror="this.src='/static/images/icons/default.png'">
      </div>
      <div class="achievement-details">
        <h4>Thành tựu mới!</h4>
        <h5>${achievement.name}</h5>
        <p>${achievement.description}</p>
        <div class="achievement-rewards">
          <span class="reward"><i class="fas fa-star"></i> ${achievement.xp_reward} XP</span>
          <span class="reward"><i class="fas fa-coins"></i> ${achievement.coin_reward} Xu</span>
          ${achievement.item_reward ? `<span class="reward"><i class="fas fa-gift"></i> ${achievement.item_reward}</span>` : ''}
        </div>
      </div>
    </div>
  `;

  showToast(achievementHtml, 'achievement', 8000);
} {
    console.error('Error:', error);
    showToast('Error receiving reward', 'danger');
  });
}

// Xử lý nút cấp thành tựu người mới bắt đầu cho tất cả người dùng
document.addEventListener('DOMContentLoaded', function() {
  const grantAchievementBtn = document.getElementById('grantStarterAchievement');
  if (grantAchievementBtn) {
    grantAchievementBtn.addEventListener('click', function() {
      if (confirm('Bạn có chắc muốn cấp thành tựu "Người mới bắt đầu" cho tất cả người dùng chưa có?')) {
        fetch('/api/grant-starter-achievement', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            showToast(data.message, 'success');
            // Reload trang sau 2 giây để hiển thị thành tựu mới
            setTimeout(function() {
              window.location.reload();
            }, 2000);
          } else {
            showToast(data.message || 'Đã xảy ra lỗi', 'danger');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          showToast('Đã xảy ra lỗi khi cấp thành tựu', 'danger');
        });
      }
    });
  }
});.message, 'danger');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          showToast('Lỗi khi cấp thành tựu', 'danger');
        });
      }
    });
  }
});

// Setup advancements functionality
function setupAdvancements() {
  const achievementsContainer = document.querySelector('#achievementTabs');
  if (!achievementsContainer) return;

  // Check for new achievements via API
  checkForNewAchievements();

  // Process all achievement cards
  const allCards = document.querySelectorAll('.achievement-card');
  allCards.forEach(card => {
    const title = card.querySelector('h5');
    if (title && title.textContent) {
      const achievementName = title.textContent.trim();
      card.setAttribute('data-achievement-name', achievementName);

      // Apply visual effects for cards that are marked as achieved in the HTML
      if (card.classList.contains('achieved')) {
        applyAchievedStyles(card);
      }
      
      // Ensure "Người mới bắt đầu" is always achieved and styled properly
      if (achievementName === "Người mới bắt đầu") {
        card.classList.add('achieved');
        applyAchievedStyles(card);
      }
    }
  });
}

function applyAchievedStyles(card) {
  // Apply visual styles to achieved cards
  card.style.opacity = '1';
  card.style.filter = 'grayscale(0)';
  
  // Add badge "Đã nhận" if not already present
  const rewardsDiv = card.querySelector('.achievement-rewards');
  if (rewardsDiv && !rewardsDiv.querySelector('.reward-status')) {
    const rewardStatus = document.createElement('div');
    rewardStatus.className = 'reward-status mb-2';
    rewardStatus.innerHTML = '<span class="badge bg-success"><i class="fas fa-check-circle"></i> Đã nhận</span>';
    rewardsDiv.prepend(rewardStatus);
  }
}

function checkForNewAchievements() {
  // Make a request to check for new achievements
  fetch('/api/check-achievements')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.new_achievements && data.new_achievements.length > 0) {
        // Process new achievements
        data.new_achievements.forEach(achievement => {
          const card = document.querySelector(`[data-achievement-name="${achievement.name}"]`);
          if (card) {
            card.classList.add('achieved');
            applyAchievedStyles(card);
          }
        });
      }
    })
    .catch(error => console.error('Error checking achievements:', error));
        }
      }
    }
  });

  // Thêm hiệu ứng cho các thành tựu đã đạt được
  const achievedCards = document.querySelectorAll('.achievement-card.achieved');
  achievedCards.forEach(card => {
    // Highlight thành tựu đã đạt được
    card.style.transform = 'translateY(-3px)';
    card.style.boxShadow = '0 5px 15px rgba(78, 115, 223, 0.15)';

    // Thêm icon hoàn thành
    const iconElement = card.querySelector('.achievement-icon');
    if (iconElement) {
      if (!iconElement.querySelector('.achievement-completed-icon')) {
        const completedIcon = document.createElement('i');
        completedIcon.className = 'fas fa-check-circle achievement-completed-icon';
        iconElement.appendChild(completedIcon);
      }
    }
  });
}ompletedIcon.className = 'fas fa-check-circle achievement-completed-icon';
      iconElement.appendChild(completedIcon);
    }

    // Thêm badge "Đã đạt được"
    const badgeElement = document.createElement('div');
    badgeElement.className = 'achievement-badge';
    badgeElement.textContent = 'Đã đạt được';
    card.appendChild(badgeElement);
  });

  // Add filter functionality
  const filterButtons = document.querySelectorAll('.achievement-filter .btn');
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
        });
      });
    });
  }

  // Explorer achievement tracking
  trackExplorerAchievement();
}

// Track explorer achievement
function trackExplorerAchievement() {
  // Use the global visitedPages
  if (typeof window.visitedPages === 'undefined') {
      window.visitedPages = new Set();
  }

  // Add current page
  const currentPath = window.location.pathname;
  window.visitedPages.add(currentPath);

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
        showToast(`Achievement unlocked: Explorer!`, 'success');
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
              statusElement.innerHTML = '<span class="badge bg-success"><i class="fas fa-check-circle"></i> Completed</span>';
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
                statusElement.innerHTML = '<span class="badge bg-success"><i class="fas fa-check-circle"></i> Completed</span>';
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
      showAlert('Error updating quest UI!', 'error');
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
      pointsDisplay.textContent = `Points: ${newPoints}/100`;
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
      showToast(`Quest completed: ${quest}`, 'success');
    });

    // Show XP and coin rewards
    if (data.xp_earned > 0) {
      showToast(`Received ${data.xp_earned} XP!`, 'success');
    }

    if (data.milestone_rewards > 0) {
      showToast(`Received ${data.milestone_rewards} coins from milestone rewards!`, 'success');
    }
  }
});

// Theo dõi các trang đã truy cập để đạt thành tựu Nhà thám hiểm
// Ensure visitedPages is only declared once globally
if (typeof window.visitedPages === 'undefined') {
    window.visitedPages = new Set();
}

// Ghi lại trang hiện tại vào danh sách đã truy cập
function trackPageVisit() {
    // Lấy đường dẫn hiện tại
    const currentPath = window.location.pathname;

    // Thêm vào danh sách các trang đã truy cập
    window.visitedPages.add(currentPath);

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
    console.log('Visited pages:', Array.from(visitedPages));
    console.log('Required pages:', mainPages);

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

    console.log(`Visited ${visitedCount}/${mainPages.length} pages`);

    // Nếu đã truy cập đủ 3 trang, gửi request để nhận thành tựu
    if (visitedCount >= 3) {
        console.log('Visited enough pages, sending achievement request');

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
            console.log('Achievement result:', data);

            if (data.success && data.achieved) {
                showToast(`🏆 Achievement unlocked: Explorer! Received ${data.reward_coins} coins and ${data.reward_xp} XP`, 'success', 5000);

                // Cập nhật UI
                updateBalanceDisplay();
            }
        })
        .catch(error => {
            console.error('Error receiving achievement:', error);
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
            console.error('Error updating quest progress:', error);
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
        console.error('Error updating quest UI:', error);
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
                    if (rewardText) rewardText += ' and ';
                    rewardText += `${achievement.coin_reward} coins`;
                }

                showToast(`🏆 Achievement unlocked: ${achievement.name}! Received ${rewardText}`, 'success', 5000);
            });
        }
    })
    .catch(error => {
        console.error('Error checking achievements:', error);
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
            console.error('Error updating coins:', error);
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
                showToast('Quest completed!', 'success');

                // Hiển thị thông báo với chi tiết phần thưởng
                if (data.coin_rewards > 0 || data.xp_earned > 0) {
                    let rewardMessage = 'You received ';
                    if (data.coin_rewards > 0) {
                        rewardMessage += data.coin_rewards + ' coins';
                    }
                    if (data.xp_earned > 0) {
                        rewardMessage += (data.coin_rewards > 0 ? ' and ' : '') + data.xp_earned + ' XP';
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

    // Kiểm tra thành tựu định kỳ (nếu hàm này tồn tại)
    if (typeof checkAchievements === 'function') {
        checkAchievements();
    }

    // Initialize tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        // Initialize tooltips only if not already initialized
        if (typeof tooltipList === 'undefined') {
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }
});

// Tooltip initialization
document.addEventListener("DOMContentLoaded", function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Admin Dashboard
    if (document.querySelector('.admin-dashboard')) {
        console.log("Admin dashboard loaded");

        // Initialize any charts if needed
        initializeAdminCharts();
    }

    // Setup admin tables if they exist
    setupAdminTables();
});

// Admin functions
function initializeAdminCharts() {
    // Placeholder for admin charts initialization
    const userStatsCanvas = document.getElementById('userStatsChart');
    if (userStatsCanvas) {
        const ctx = userStatsCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1 month ago', '3 weeks ago', '2 weeks ago', '1 week ago', 'Today'],
                datasets: [{
                    label: 'New Users',
                    data: [12, 19, 15, 25, 32],
                    borderColor: '#4e73df',
                    tension: 0.3,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function setupAdminTables() {
    // Add datatable functionality to admin tables if needed
    const adminTables = document.querySelectorAll('.admin-table');
    if (adminTables.length > 0) {
        adminTables.forEach(table => {
            // Add sorting and filtering capabilities here if needed
        });
    }

    // Ensure modals are properly initialized
    if (typeof bootstrap !== 'undefined') {
        const userModals = document.querySelectorAll('.modal');
        userModals.forEach(modalElement => {
            new bootstrap.Modal(modalElement);
        });
    }
}

// User editing functionality
function confirmUserAction(action, userId, username) {
    if (action === 'toggleAdmin') {
        if (confirm(`Bạn có chắc chắn muốn thay đổi trạng thái admin của người dùng ${username}?`)) {
            document.getElementById(`toggleAdmin-${userId}`).submit();
        }
    } else if (action === 'saveChanges') {
        document.getElementById(`editUserForm-${userId}`).submit();
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup user edit buttons
    const editButtons = document.querySelectorAll('.btn-edit-user');
    if (editButtons.length > 0) {
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');
                const modalId = `editModal${userId}`;
                const modalElement = document.getElementById(modalId);
                if (modalElement && typeof bootstrap !== 'undefined') {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            });
        });
    }
});

// Ensure modals are properly initialized when the page loads
document.addEventListener("DOMContentLoaded", function() {
    // Initialize all modals if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        var modals = document.querySelectorAll('.modal');
        modals.forEach(function(modal) {
            new bootstrap.Modal(modal);
        });
    }
});

// Question management
function confirmQuestionAction(action, questionId) {
    if (action === 'delete') {
        if (confirm('Are you sure you want to delete this question?')) {
            document.getElementById(`deleteQuestion-${questionId}`).submit();
        }
    }
}

// Contribution management
function confirmContributionAction(action, contributionId) {
    if (action === 'approve') {
        if (confirm('Are you sure you want to approve this contribution?')) {
            document.getElementById(`approveContribution-${contributionId}`).submit();
        }
    } else if (action === 'reject') {
        if (confirm('Are you sure you want to reject this contribution?')) {
            document.getElementById(`rejectContribution-${contributionId}`).submit();
        }
    }
}

// User point display formatting
function formatUserPoints(points) {
    return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Show user details in popup
function showUserDetails(userId) {
    const userDetailModal = document.getElementById(`userDetail-${userId}`);
    if (userDetailModal) {
        const modal = new bootstrap.Modal(userDetailModal);
        modal.show();
    }
}

// Show question details in popup
function showQuestionDetails(questionId) {
    const questionDetailModal = document.getElementById(`questionDetail-${questionId}`);
    if (questionDetailModal) {
        const modal = new bootstrap.Modal(questionDetailModal);
        modal.show();
    }
}

function displayQuestion(question, index, total) {
    document.getElementById('question-text').textContent = question.question_text;
    document.getElementById('label-a').textContent = question.options.A;
    document.getElementById('label-b').textContent = question.options.B;
    document.getElementById('label-c').textContent = question.options.C;
    document.getElementById('label-d').textContent = question.options.D;

    // Handle question image if present
    const questionImageContainer = document.getElementById('question-image-container');
    const questionImage = document.getElementById('question-image');

    if (question.question_image_url) {
        questionImage.src = question.question_image_url;
        questionImageContainer.style.display = 'block';
    } else {
        questionImageContainer.style.display = 'none';
    }

    // Clear previous selections
    document.querySelectorAll('input[name="answer"]').forEach(radio => {
        radio.checked = false;
    });

    // Update question counter
    document.getElementById('question-counter').textContent = `Question ${index + 1} of ${total}`;

    // Show question difficulty
    let difficultyBadge = document.getElementById('difficulty-badge');
    difficultyBadge.textContent = question.difficulty;
    difficultyBadge.className = 'badge'; // Reset class

    // Add appropriate color based on difficulty
    if (question.difficulty === 'Easy') {
        difficultyBadge.classList.add('bg-success');
    } else if (question.difficulty === 'Medium') {
        difficultyBadge.classList.add('bg-warning');
        difficultyBadge.classList.add('text-dark');
    } else if (question.difficulty === 'Hard') {
        difficultyBadge.classList.add('bg-danger');
    }

    // Show question container
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('feedback-container').style.display = 'none';

    // Reset timer if needed
    if (window.questionTimer) {
        clearInterval(window.questionTimer);
    }
    updateTimer();
}

function showFeedback(data) {
    // Update the feedback elements
    const feedbackElement = document.getElementById('feedback');
    const explanationElement = document.getElementById('explanation');
    const explanationImageContainer = document.getElementById('explanation-image-container');
    const explanationImage = document.getElementById('explanation-image');

    if (data.correct) {
        feedbackElement.textContent = `Correct! The answer is ${data.correct_answer}.`;
        feedbackElement.className = 'alert alert-success';

        // Show rewards
        if (data.xp_gained) {
            feedbackElement.textContent += ` +${data.xp_gained} XP`;
        }
        if (data.coins_gained) {
            feedbackElement.textContent += `, +${data.coins_gained} coins`;
        }

        // Show rank up message if applicable
        if (data.ranked_up) {
            feedbackElement.textContent += ` 🎉 Ranked up: ${data.new_rank}!`;
        }
    } else {
        feedbackElement.textContent = `Incorrect! The correct answer is ${data.correct_answer}.`;
        feedbackElement.className = 'alert alert-danger';
    }

    if (data.explanation) {
        explanationElement.textContent = data.explanation;
        explanationElement.style.display = 'block';
    } else {
        explanationElement.style.display = 'none';
    }

    // Handle explanation image if present
    if (data.explanation_image_url) {
        explanationImage.src = data.explanation_image_url;
        explanationImageContainer.style.display = 'block';
    } else {
        explanationImageContainer.style.display = 'none';
    }

    // Hide the question container and show the feedback container
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('feedback-container').style.display = 'block';

    // Stop the timer
    if (window.questionTimer) {
        clearInterval(window.questionTimer);
    }

    // Update the UI with the new values if available
    if (data.new_xp !== undefined) {
        updateXPProgressBar(data.new_xp);
    }

    if (data.new_coins !== undefined) {
        updateCoinsDisplay(data.new_coins);
    }
}

// Kiểm tra và cập nhật điểm số
function updateUserScore(newScore) {
    const scoreElement = document.getElementById('user-score');
    if (scoreElement) {
        const currentScore = parseInt(scoreElement.textContent);
        scoreElement.textContent = newScore;

        // Hiệu ứng animation khi cập nhật điểm
        scoreElement.classList.add('score-update');
        setTimeout(() => {
            scoreElement.classList.remove('score-update');
        }, 1000);

        // Hiển thị thông báo
        if (newScore > currentScore) {
            showNotification("Points +" + (newScore - currentScore), 'success');
        }
    }
}

// Cập nhật thanh tiến trình XP
function updateXPProgressBar(newXP) {
    const xpProgressBar = document.getElementById('xpProgressBar');
    if (xpProgressBar) {
        const maxXP = parseInt(xpProgressBar.getAttribute('max'));
        const percentage = (newXP / maxXP) * 100;
        xpProgressBar.value = newXP;
        xpProgressBar.style.width = `${percentage}%`;
    }
}

// Cập nhật hiển thị số xu
function updateCoinsDisplay(newCoins) {
    const coinsDisplay = document.getElementById('user-coins');
    if (coinsDisplay) {
        coinsDisplay.textContent = newCoins;
    }
}

// Hàm cập nhật thời gian đếm ngược
let timeLeft = 0;
let questionTimer = null;

function updateTimer() {
    const timerElement = document.getElementById('timer');
    const question = currentQuestions[currentQuestionIndex];

    if (question) {
        timeLeft = question.time_limit;
        timerElement.textContent = formatTime(timeLeft);

        questionTimer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = formatTime(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(questionTimer);
                submitAnswer('timeout'); // Submit timeout answer
            }
        }, 1000);
    }
}

// Hàm định dạng thời gian
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Hàm xử lý khi người dùng chọn câu trả lời
function submitAnswer(answer) {
    const question = currentQuestions[currentQuestionIndex];

    fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            question_id: question.id,
            answer: answer
        })
    })
    .then(response => response.json())
    .then(data => {
        showFeedback(data);

        // If quiz is not complete
        if (currentQuestionIndex < currentQuestions.length - 1) {
            setTimeout(() => {
                currentQuestionIndex++;
                displayQuestion(currentQuestions[currentQuestionIndex], currentQuestionIndex, currentQuestions.length);
            }, 3000);
        } else {
            // Update overall score and show final results
            updateUserScore(score);
        }
    })
    .catch(error => {
        console.error('Error submitting answer:', error);
        showError('Failed to submit answer. Please try again.');
    });
}

// Hàm hiển thị thông báo
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000); // Hide after 3 seconds
}

// Xử lý khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    // Load quiz questions based on URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    const difficulty = urlParams.get('difficulty');

    if (subject && difficulty) {
        startQuiz(subject, difficulty);
    }
});

// Admin dashboard loaded message
if (window.location.pathname.includes('admin')) {
    console.log('Admin dashboard loaded');

    // Debounce function to prevent rapid UI updates
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Apply debounce to form submissions in admin area
    const adminForms = document.querySelectorAll('.admin-content form');
    adminForms.forEach(form => {
        form.addEventListener('submit', debounce(function(e) {
            // Allow the form to submit normally, but prevent multiple rapid submissions
        }, 500));
    });
}

// Function to update the progress bar
function updateProgressBar(progressBar, value) {
    const newPoints = Math.min(100, Math.max(0, value));
    progressBar.querySelector('.progress-bar').style.width = `${newPoints}%`;
    progressBar.querySelector('.progress-text').textContent = `Points: ${newPoints}%`;
}

// Function to check for new achievements
function checkAchievements() {
    // Chỉ kiểm tra nếu người dùng đã đăng nhập
    if (!isUserLoggedIn()) return;

    fetch('/api/check-achievements')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.new_achievements.length > 0) {
                showAchievementNotification(data.new_achievements);
                // Cập nhật lại thông tin người dùng nếu có thay đổi XP hoặc Xu
                updateUserInfo();
            }
        })
        .catch(error => {
            console.error('Error checking achievements:', error);
        });
}

// Kiểm tra thành tựu khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra thành tựu ngay khi tải trang
    checkAchievements();

    // Kiểm tra định kỳ mỗi 5 phút
    setInterval(checkAchievements, 300000);
});

// Function to check if user is logged in
function isUserLoggedIn() {
    // Kiểm tra qua element có class user-info hoặc tương tự
    return document.querySelector('.user-profile') !== null;
}

// Function to update user information
function updateUserInfo() {
    // Tải lại trang hoặc thực hiện AJAX request để cập nhật thông tin
    // Ví dụ đơn giản nhất là tải lại trang
    // location.reload();

    // Hoặc thực hiện AJAX request để cập nhật thông tin cụ thể
    fetch('/api/user-info')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Cập nhật thông tin người dùng trên giao diện
                if (data.coins) {
                    updateUserCoins(data.coins);
                }
                if (data.experience) {
                    updateUserExperience(data.experience);
                }
            }
        })
        .catch(error => {
            console.error('Error updating user info:', error);
        });
}

// Function to handle mobile animations
function handleMobileAnimations() {
    if (window.innerWidth < 768) {
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.classList.add('aos-animate');
        });
    }
}

// Add event listener for window resize
window.addEventListener('resize', handleMobileAnimations);

// Call the function on page load
handleMobileAnimations();

// Function to animate progress bars
function animateProgressBars() {
    document.querySelectorAll('.progress-bar').forEach(bar => {
        const width = bar.getAttribute('aria-valuenow') + '%';
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// Function to check for new achievements
function checkNewAchievements() {
    if (document.querySelector('.user-info')) {
        fetch('/api/check-achievements')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.new_achievements.length > 0) {
                    data.new_achievements.forEach(achievement => showAchievementNotification(achievement));
                }
            })
            .catch(error => console.error('Error checking achievements:', error));
    }
}

// Function to display achievement notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <h3>${achievement.name}</h3>
        <p>${achievement.description}</p>
        <p>Rewards: ${achievement.xp_reward} XP, ${achievement.coin_reward} coins</p>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 5000); // Hide after 5 seconds
}

// Function to setup quiz functionality
function setupQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    if (quizContainer) {
        const startQuizBtn = document.getElementById('start-quiz');
        startQuizBtn.addEventListener('click', startQuizHandler);
    }
}

// Function to handle start quiz button click
function startQuizHandler() {
    const subject = document.getElementById('subject').value;
    const difficulty = document.getElementById('difficulty').value;
    if (subject && difficulty) {
        startQuiz(subject, difficulty);
    } else {
        alert('Please select subject and difficulty.');
    }
}

// Function to start quiz
function startQuiz(subject, difficulty) {
    fetch(`/api/questions?subject=${subject}&difficulty=${difficulty}`)
        .then(response => response.json())
        .then(data => {
            currentQuestions = data.questions;
            currentQuestionIndex = 0;
            score = 0;
            displayQuestion(currentQuestions[currentQuestionIndex], currentQuestionIndex, currentQuestions.length);
        })
        .catch(error => console.error('Error starting quiz:', error));
}


// Function to animate number counters
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

// Function to handle quest completion for shop visits
function handleShopVisitQuest() {
    if (window.location.pathname.includes('/shop')) {
        fetch('/quiz_complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject: 'shop_visit' })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.completed_quests.length > 0) {
                    data.completed_quests.forEach(quest => showToast(`Quest completed: ${quest}`, 'success'));
                    if (data.points_earned > 0) showToast(`Received ${data.points_earned} quest points!`, 'success');
                    updateUserStats(data);
                }
            })
            .catch(error => console.error('Error handling shop visit quest:', error));
    }
}

// Function to handle "Visit Shop" button clicks
function handleVisitShopButton() {
    document.querySelectorAll('.btn-outline-primary').forEach(button => {
        button.addEventListener('click', function(e) {
            const questItem = this.closest('.list-group-item');
            const questDescription = questItem.querySelector('h5').textContent;
            if (questDescription.includes('Visit Shop')) {
                const badge = questItem.querySelector('.badge');
                if (badge) {
                    badge.classList.remove('bg-secondary');
                    badge.classList.add('bg-success');
                    badge.innerHTML = '<i class="fas fa-check"></i>';
                }
                this.textContent = 'Completed';
                this.classList.remove('btn-outline-primary');
                this.classList.add('bg-success', 'text-white');
                this.disabled = true;
            }
        });
    });
}

// Function to update quest progress
function updateQuestProgress() {
    if (window.location.pathname.includes('/daily-quests') || window.location.pathname.includes('/advancements')) {
        fetch('/quiz_complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'refresh' })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateProgressBar(document.getElementById('daily-quest-progress'), data.daily_points);
                    if (data.quest_statuses) {
                        data.quest_statuses.forEach(quest => {
                            const questElement = document.querySelector(`.quest-item[data-id="${quest.id}"]`);
                            if (questElement) {
                                if (quest.completed) questElement.classList.add('completed');
                            }
                        });
                    }
                }
            })
            .catch(error => console.error('Error updating quest progress:', error));
    }
}

// Function to update quest UI
function updateQuestUI() {
    fetch('/daily-quests/update')
        .then(response => response.json())
        .then(data => {
            if (data.updated) {
                updateProgressBar(document.querySelector('.progress-bar'), data.progress);
                data.completed_quests.forEach(quest => {
                    const questElement = document.querySelector(`.quest-item[data-id="${quest.id}"]`);
                    if (questElement && quest.completed) questElement.classList.add('completed');
                });
                data.milestones.forEach(milestone => {
                    const milestoneElement = document.querySelector(`.milestone-item[data-id="${milestone.id}"]`);
                    if (milestoneElement && milestone.isCompleted) milestoneElement.classList.add('completed');
                });
            }
        })
        .catch(error => console.error('Error updating quest UI:', error));
}


// Function to update user stats
function updateUserStats(data) {
    if (data.new_xp !== undefined) document.querySelectorAll('.user-xp').forEach(el => el.textContent = data.new_xp);
    if (data.new_coins !== undefined) document.querySelectorAll('.user-coins').forEach(el => el.textContent = data.new_coins);
    if (data.daily_points !== undefined) {        document.querySelectorAll('.daily-quest-points').forEach(el => el.textContent = data.daily_points);
        const progressBar = document.querySelector('.progress-bar[aria-valuenow]');
        if (progressBar) {
            progressBar.style.width = `${(data.daily_points / 100) * 100}%`;
            progressBar.setAttribute('aria-valuenow', data.daily_points);
            progressBar.textContent = `${data.daily_points}/100`;
        }
        document.querySelectorAll('.reward-milestone').forEach(milestone => {
            const milestoneValue = parseInt(milestone.getAttribute('data-milestone'));
            if (data.daily_points >= milestoneValue) milestone.classList.add('milestone-reached');
            else milestone.classList.remove('milestone-reached');
        });
    }
    if (data.quest_statuses) {
        const questsList = document.getElementById('questsList');
        if (questsList) {
            data.quest_statuses.forEach(quest => {
                const questCard = questsList.querySelector(`.quest-card[data-quest-id="${quest.id}"]`);
                if (questCard && quest.completed) {
                    questCard.classList.add('completed');
                    const statusElement = questCard.querySelector('.quest-status');
                    if (statusElement) statusElement.innerHTML = '<span class="badge bg-success"><i class="fas fa-check-circle"></i> Completed</span>';
                }
            });
        }
    }
}

// Function to show toast notifications
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container') || document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);

    const toast = document.createElement('div');
    toast.className = `toast show bg-${type} text-white`;
    toast.innerHTML = `
        <div class="toast-header bg-${type} text-white">
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}


// Achievement management
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý lọc thành tựu
    const filterButtons = document.querySelectorAll('.achievement-filter .btn');
    const achievementCards = document.querySelectorAll('.achievement-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Đổi trạng thái active
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            // Lọc thành tựu
            achievementCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'flex';
                } else if (filter === 'achieved' && card.classList.contains('achieved')) {
                    card.style.display = 'flex';
                } else if (filter === 'unachieved' && !card.classList.contains('achieved')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Kiểm tra thành tựu mới khi trang tải
    checkNewAchievements();
});

// Hàm kiểm tra thành tựu mới 
function checkNewAchievements() {
    fetch('/check-achievements')
        .then(response => response.json())
        .then(data => {
            if (data.new_achievements && data.new_achievements.length > 0) {
                showAchievementNotification(data.new_achievements);
            }
        })
        .catch(error => console.error('Error checking achievements:', error));
}

// Hiển thị thông báo thành tựu mới
function showAchievementNotification(achievements) {
    achievements.forEach(achievement => {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="achievement-notification-content">
                <h4>Thành tựu mới!</h4>
                <p>${achievement.name}</p>
                <div class="achievement-notification-rewards">
                    ${achievement.xp_reward > 0 ? `<span class="badge bg-primary"><i class="fas fa-star"></i> +${achievement.xp_reward} XP</span>` : ''}
                    ${achievement.coin_reward > 0 ? `<span class="badge bg-warning text-dark"><i class="fas fa-coins"></i> +${achievement.coin_reward} Xu</span>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animation để hiển thị thông báo
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Ẩn thông báo sau 5 giây
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    });
}
// Function to update user balance display
function updateBalanceDisplay() {
    const coinDisplay = document.getElementById('user-coins');
    if (coinDisplay) {
        fetch('/quiz_complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'refresh' })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) coinDisplay.textContent = data.new_coins;
            })
            .catch(error => console.error('Error updating coins:', error));
    }
}

// Function to track page visits for Explorer achievement
// Using the global visitedPages

function trackPageVisit() {
    const currentPath = window.location.pathname;
    visitedPages.add(currentPath);
    console.log("Page visited:", currentPath);
}

// Function to check achievements
function checkAchievements() {
    // Check if user is authenticated (you can determine this by checking for a user-specific element)
    const isAuthenticated = document.querySelector('.user-profile') !== null || 
                           document.body.classList.contains('authenticated');

    if (!isAuthenticated) {
        console.log("User not authenticated, skipping achievement check");
        return;
    }

    fetch('/api/check-achievements')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Achievement check completed");
            if (data.new_achievements && data.new_achievements.length > 0) {
                // Display achievement notification
                showAchievementNotification(data.new_achievements);
            }
        })
        .catch(error => {
            console.log("Error checking achievements:", error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    // Track page visit
    trackPageVisit();

    if (typeof feather !== 'undefined') feather.replace();
    setupQuiz();
    handleShopVisitQuest();
    handleVisitShopButton();
    updateQuestProgress();
    checkAchievements();
    if (window.location.pathname.includes('/admin')) {
        console.log('Admin dashboard loaded');
        setInterval(refreshDashboardStats, 10000);
    }
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        if (typeof tooltipList === 'undefined') {
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }
});

// Function to refresh dashboard stats
function refreshDashboardStats() {
    if (window.location.pathname.includes('/admin/dashboard')) {
        fetch('/admin/dashboard', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const statElements = document.querySelectorAll('.stat-number');
                const newStatElements = doc.querySelectorAll('.stat-number');
                for (let i = 0; i < statElements.length; i++) {
                    if (newStatElements[i] && statElements[i]) {
                        statElements[i].textContent = newStatElements[i].textContent;
                        statElements[i].classList.remove('highlight-update');
                        void statElements[i].offsetWidth;
                        statElements[i].classList.add('highlight-update');
                    }
                }
            })
            .catch(error => console.error('Error refreshing stats:', error));
    }
}

// Function to show toast notifications
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container') || document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);

    const toast = document.createElement('div');
    toast.className = `toast show bg-${type} text-white`;
    toast.innerHTML = `
        <div class="toast-header bg-${type} text-white">
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}


// Achievement management
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý lọc thành tựu
    const filterButtons = document.querySelectorAll('.achievement-filter .btn');
    const achievementCards = document.querySelectorAll('.achievement-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Đổi trạng thái active
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            // Lọc thành tựu
            achievementCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'flex';
                } else if (filter === 'achieved' && card.classList.contains('achieved')) {
                    card.style.display = 'flex';
                } else if (filter === 'unachieved' && !card.classList.contains('achieved')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Kiểm tra thành tựu mới khi trang tải
    checkNewAchievements();
});

// Hàm kiểm tra thành tựu mới 
function checkNewAchievements() {
    fetch('/check-achievements')
        .then(response => response.json())
        .then(data => {
            if (data.new_achievements && data.new_achievements.length > 0) {
                showAchievementNotification(data.new_achievements);
            }
        })
        .catch(error => console.error('Error checking achievements:', error));
}

// Hiển thị thông báo thành tựu mới
function showAchievementNotification(achievements) {
    achievements.forEach(achievement => {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="achievement-notification-content">
                <h4>Thành tựu mới!</h4>
                <p>${achievement.name}</p>
                <div class="achievement-notification-rewards">
                    ${achievement.xp_reward > 0 ? `<span class="badge bg-primary"><i class="fas fa-star"></i> +${achievement.xp_reward} XP</span>` : ''}
                    ${achievement.coin_reward > 0 ? `<span class="badge bg-warning text-dark"><i class="fas fa-coins"></i> +${achievement.coin_reward} Xu</span>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animation để hiển thị thông báo
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Ẩn thông báo sau 5 giây
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    });
}