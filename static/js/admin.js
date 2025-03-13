// Admin JS File
document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize modals
  const modalEls = document.querySelectorAll('.modal');
  modalEls.forEach(modalEl => {
    if (typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalEl);
    }
  });

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

// Hàm xác nhận hành động trên người dùng
function confirmUserAction(action, userId, username) {
  if (action === 'toggleAdmin') {
    if (confirm(`Bạn có chắc chắn muốn thay đổi trạng thái admin của người dùng ${username}?`)) {
      document.getElementById(`toggleAdmin-${userId}`).submit();
    }
  } else if (action === 'saveChanges') {
    document.getElementById(`editUserForm-${userId}`).submit();
  }
}

// File js cho trang admin
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý các sự kiện trong trang admin
    console.log('Admin JS loaded');

    // Xử lý cho modal chỉnh sửa người dùng
    const editButtons = document.querySelectorAll('.edit-user-btn');
    if (editButtons.length > 0) {
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');
                const modalId = `editModal${userId}`;
                const modal = document.getElementById(modalId);

                if (modal && typeof bootstrap !== 'undefined') {
                    const bsModal = new bootstrap.Modal(modal);
                    bsModal.show();
                } else {
                    console.error(`Modal with id ${modalId} not found or Bootstrap not loaded`);
                }
            });
        });
    }
});

// Contribution management
function confirmContributionAction(action, contributionId) {
    if (action === 'approve') {
        if (confirm('Bạn có chắc chắn muốn phê duyệt đóng góp này?')) {
            document.getElementById(`approveContribution-${contributionId}`).submit();
        }
    } else if (action === 'reject') {
        if (confirm('Bạn có chắc chắn muốn từ chối đóng góp này?')) {
            document.getElementById(`rejectContribution-${contributionId}`).submit();
        }
    }
}