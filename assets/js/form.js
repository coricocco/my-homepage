/**
 * Form Handling & Validation - 放課後等デイサービス コリコッコ
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const typeButtons = document.querySelectorAll('.form-type-btn');
  const typeInput = document.getElementById('inquiryTypeInput');
  const dateGroup = document.getElementById('preferredDateGroup');
  const successModal = document.getElementById('successModal');

  // Set min date for reservation picker (today or future)
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Type selection buttons
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedType = btn.getAttribute('data-type');
      if (typeInput) typeInput.value = selectedType;

      // Toggle preferred date requirement/visibility
      if (dateGroup) {
        if (selectedType === '見学・無料体験予約') {
          dateGroup.style.display = 'block';
        } else {
          dateGroup.style.display = 'block'; // Keep visible as optional
        }
      }
    });
  });

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate fields
    const parentName = document.getElementById('parentName');
    const childInfo = document.getElementById('childInfo');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const consent = document.getElementById('privacyConsent');

    // Helper functions
    function setError(input, msg) {
      input.classList.add('error');
      const errEl = input.parentElement.querySelector('.form-error-msg');
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.add('show');
      }
      isValid = false;
    }

    function clearError(input) {
      input.classList.remove('error');
      const errEl = input.parentElement.querySelector('.form-error-msg');
      if (errEl) {
        errEl.classList.remove('show');
      }
    }

    // Reset errors
    [parentName, childInfo, email, phone].forEach(input => {
      if (input) clearError(input);
    });

    // Parent Name
    if (!parentName.value.trim()) {
      setError(parentName, '保護者様のお名前をご入力ください。');
    }

    // Child Info
    if (!childInfo.value.trim()) {
      setError(childInfo, 'お子様のご年齢または学年をご入力ください。');
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      setError(email, 'メールアドレスをご入力ください。');
    } else if (!emailRegex.test(email.value.trim())) {
      setError(email, '正しいメールアドレスの形式でご入力ください。');
    }

    // Phone
    const phoneRegex = /^0\d{1,4}-?\d{1,4}-?\d{3,4}$/;
    if (!phone.value.trim()) {
      setError(phone, 'お電話番号をご入力ください。');
    } else if (!phoneRegex.test(phone.value.trim().replace(/\s+/g, ''))) {
      setError(phone, '有効な電話番号（例: 090-1234-5678）をご入力ください。');
    }

    // Privacy Consent
    if (consent && !consent.checked) {
      alert('個人情報保護方針への同意をお願いいたします。');
      isValid = false;
    }

    if (!isValid) {
      const firstError = form.querySelector('.form-control.error');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    // Validated - simulate submission
    const submitBtn = form.querySelector('.form-submit-btn');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>送信中...</span>';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      // Show Success Modal
      if (successModal) {
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      form.reset();
      typeButtons[0].click(); // reset to first type
    }, 900);
  });

  // Real-time error clearing on input
  form.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errEl = input.parentElement.querySelector('.form-error-msg');
      if (errEl) errEl.classList.remove('show');
    });
  });
}
