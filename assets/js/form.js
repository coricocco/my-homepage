/**
 * Form Handling, Validation & Google Spreadsheet (GAS) Integration
 * 放課後等デイサービス コリコッコ / 合同会社コリコ
 */

// Google Apps Script Web App Endpoint URL (スプレッドシート自動保存 & メール通知: corico.20260609@gmail.com)
const GAS_ENDPOINT_URL = 'https://script.google.com/macros/s/AKfycbxdKrn_8aUaih_MUrVIgewbQs70rPpt9dzghVhlhdmNbcrD6NeWuyBR0ztfUZjpZkof/exec';

// Google Form (formResponse) Fallback URL
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdlWEgG-w09HqXrSTF6ayxUgXY9XV3ZbQIHwHBgksL-7pYEZQ/formResponse';

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
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedType = btn.getAttribute('data-type');
      if (typeInput) typeInput.value = selectedType;

      // Toggle preferred date visibility
      if (dateGroup) {
        dateGroup.style.display = 'block';
      }
    });
  });

  // Form submission handler
  form.addEventListener('submit', async (e) => {
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

    // Phone normalization (convert full-width numbers & hyphens to half-width)
    let phoneVal = phone.value.trim().replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    phoneVal = phoneVal.replace(/[ー−―ー]/g, '-').replace(/\s+/g, '');
    phone.value = phoneVal;

    const phoneRegex = /^0\d{1,4}-?\d{1,4}-?\d{3,4}$/;
    if (!phoneVal) {
      setError(phone, 'お電話番号をご入力ください。');
    } else if (!phoneRegex.test(phoneVal)) {
      setError(phone, '有効な電話番号（例: 076-200-8467）をご入力ください。');
    }

    // Privacy Consent
    if (consent && !consent.checked) {
      alert('個人情報保護方針への同意をお願いいたします。');
      isValid = false;
    }

    // If validation fails, block form submission
    if (!isValid) {
      const firstError = form.querySelector('.form-control.error');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    // Validation PASSED: Send data
    const submitBtn = form.querySelector('.form-submit-btn');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>送信中...</span>';

    // Accurately capture selected inquiry type
    let selectedInquiryType = '見学・無料体験予約';
    const activeTypeBtn = document.querySelector('.form-type-btn.active');
    if (activeTypeBtn) {
      selectedInquiryType = activeTypeBtn.getAttribute('data-type') || activeTypeBtn.innerText.replace(/^[^\w\s\u3000-\u9fff]+/u, '').trim();
    } else if (typeInput && typeInput.value) {
      selectedInquiryType = typeInput.value;
    }

    // Collect concerns
    const concernsChecked = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
      .filter(cb => cb.id !== 'privacyConsent')
      .map(cb => cb.value)
      .join(', ');

    const payload = {
      inquiryType: selectedInquiryType,
      parentName: parentName.value.trim(),
      parentKana: document.getElementById('parentKana') ? document.getElementById('parentKana').value.trim() : '',
      childInfo: childInfo.value.trim(),
      certificateStatus: document.getElementById('certificateStatus') ? document.getElementById('certificateStatus').value : '持っていない（申請サポート希望）',
      email: email.value.trim(),
      phone: phoneVal,
      preferredDate: document.getElementById('preferredDate') ? document.getElementById('preferredDate').value : '',
      concerns: concernsChecked,
      message: document.getElementById('message') ? document.getElementById('message').value.trim() : ''
    };

    // 1. Send to Google Apps Script Web App (mode: 'no-cors' allows seamless cross-origin POST on mobile)
    try {
      await fetch(GAS_ENDPOINT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('GAS submission notice:', err);
    }

    // 2. Secondary fallback submit to Google Form
    try {
      HTMLFormElement.prototype.submit.call(form);
    } catch (e) {
      // ignore
    }

    // Ensure smooth UI transition
    await new Promise(resolve => setTimeout(resolve, 600));

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    // Show Success Modal
    if (successModal) {
      successModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    form.reset();
    typeButtons[0].click(); // reset to first type
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
