document.addEventListener("DOMContentLoaded", function () {

  // --- Core Form Data State ---
  const formData = {
    personalInfo: {
      name: '',
      email: '',
      phone: ''
    },
    plan: {
      name: null,
      monthlyPrice: 0,
      yearlyPrice: 0
    },
    isYearly: false,
    addOns: [],
    totalPrice: 0
  };

  const DOMElements = {
    steps: document.querySelectorAll('.form-step'),
    stepNumbers: document.querySelectorAll('.step-number'),
    nextButtons: document.querySelectorAll('.next-button'),
    prevButtons: document.querySelectorAll('.prev-button'),
    confirmButton: document.getElementById("confirm-button"),

    // Step 1
    step1Form: document.querySelector('#step-1 form'),
    nameInput: document.getElementById('name'),
    emailInput: document.getElementById('email'),
    phoneInput: document.getElementById('phone'),

    // Step 2
    planCards: document.querySelectorAll('.plan-card'),
    billingToggle: document.getElementById("billingToggle"),
    monthlyLabel: document.getElementById('monthly-label'),
    yearlyLabel: document.getElementById('yearly-label'),
    planPrices: document.querySelectorAll('.plan-card .plan-price'),
    planPromos: document.querySelectorAll('.plan-card .plan-promo'),

    // Step 3
    addOnCheckboxes: document.querySelectorAll('.add-on-checkbox'),
    addOnPrices: document.querySelectorAll('.add-on-card .add-on-price'),

    // Step 4
    summaryContainer: document.getElementById('step-4'),
    selectedPlanNameSummary: document.querySelector('.selected-plan-name-summary'),
    selectedPlanPriceSummary: document.querySelector('.selected-plan-price-summary'),
    addOnSummaryContainer: document.querySelector('.add-on-summary'),
    totalBillingPeriod: document.getElementById('total-billing-period'),
    totalPriceSummary: document.getElementById('total-price-summary'),
    changePlanButton: document.getElementById('change-subscription')
  };

  const THANK_YOU_STEP_INDEX = DOMElements.steps.length - 1;
  const SUMMARY_STEP_INDEX = DOMElements.steps.length - 2;
  let currentStep = 0;

  /**
   * Displays the current step and updates sidebar active state.
   */
  function showStep(index) {
    DOMElements.steps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });

    DOMElements.stepNumbers.forEach((stepNumber, i) => {
      stepNumber.classList.toggle('active', i === index);
    });

    // Hide navigation buttons on thank you step
    const formNavs = document.querySelectorAll('.form-navigation');
    formNavs.forEach(nav => {
      if (index === THANK_YOU_STEP_INDEX) {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'flex';
      }
    });
  }

  /**
   * Validates Step 1 fields (Name, Email, Phone).
   */
  function validateStep1() {
    let isValid = true;
    const inputs = [
      DOMElements.nameInput,
      DOMElements.emailInput,
      DOMElements.phoneInput
    ];

    inputs.forEach(input => {
      const formGroup = input.closest('.form-group');
      const errorSpan = formGroup.querySelector('.error-message');

      if (!input.checkValidity()) {
        isValid = false;
        input.classList.add('is-invalid');
        if (errorSpan) {
          if (input.validity.valueMissing) {
            errorSpan.textContent = 'This field is required';
          } else if (input.type === 'email' && input.validity.typeMismatch) {
            errorSpan.textContent = 'Please enter a valid email address';
          } else if (input.type === 'tel' && input.validity.patternMismatch) {
            errorSpan.textContent = 'Please enter a valid phone number';
          }
          errorSpan.style.display = 'inline';
        }
      } else {
        input.classList.remove('is-invalid');
        if (errorSpan) errorSpan.style.display = 'none';
      }
    });

    return isValid;
  }

  /**
   * Validates Step 2: Ensures a plan card is selected.
   */
  function validateStep2() {
    const selectedPlan = document.querySelector('.plan-card.selected');
    if (!selectedPlan) {
      alert('Please select a plan before proceeding.');
      return false;
    }
    return true;
  }

  /**
   * Updates the UI prices for plans and add-ons based on billing toggle.
   */
  function updatePricingUI() {
    const isYearly = formData.isYearly;
    const period = isYearly ? 'yr' : 'mo';
    const promoDisplay = isYearly ? 'block' : 'none';

    DOMElements.planCards.forEach(card => {
      const priceEl = card.querySelector('.plan-price');
      const promoEl = card.querySelector('.plan-promo');
      const monthlyPrice = card.dataset.monthlyPrice;
      const yearlyPrice = card.dataset.yearlyPrice;

      priceEl.textContent = `$${isYearly ? yearlyPrice : monthlyPrice}/${period}`;
      if (promoEl) {
        promoEl.style.display = promoDisplay;
      }
    });

    DOMElements.addOnCheckboxes.forEach(checkbox => {
      const priceEl = checkbox.closest('.add-on-card').querySelector('.add-on-price');
      const monthlyPrice = checkbox.dataset.monthlyPrice;
      const yearlyPrice = checkbox.dataset.yearlyPrice;

      priceEl.textContent = `+$${isYearly ? yearlyPrice : monthlyPrice}/${period}`;
    });

    DOMElements.monthlyLabel.classList.toggle('active', !isYearly);
    DOMElements.yearlyLabel.classList.toggle('active', isYearly);
  }

  /**
   * Gathers all selected data and updates the summary on Step 4.
   */
  function updateSummary() {
    DOMElements.addOnSummaryContainer.innerHTML = '';
    formData.addOns = [];

    const selectedPlanCard = document.querySelector('.plan-card.selected');
    if (selectedPlanCard) {
      formData.plan.name = selectedPlanCard.dataset.plan;
      formData.plan.monthlyPrice = parseFloat(selectedPlanCard.dataset.monthlyPrice);
      formData.plan.yearlyPrice = parseFloat(selectedPlanCard.dataset.yearlyPrice);
    } else {
      formData.plan.name = null;
      formData.plan.monthlyPrice = 0;
      formData.plan.yearlyPrice = 0;
    }

    const planName = formData.plan.name ? formData.plan.name.charAt(0).toUpperCase() + formData.plan.name.slice(1) : '';
    const planPrice = formData.isYearly ? formData.plan.yearlyPrice : formData.plan.monthlyPrice;
    const billingPeriodText = formData.isYearly ? 'Yearly' : 'Monthly';
    const billingPeriodAbbr = formData.isYearly ? 'yr' : 'mo';

    DOMElements.selectedPlanNameSummary.textContent = `${planName} (${billingPeriodText})`;
    DOMElements.selectedPlanPriceSummary.textContent = `$${planPrice}/${billingPeriodAbbr}`;

    DOMElements.addOnCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        const addOnCard = checkbox.closest('.add-on-card');
        const addOnName = addOnCard.querySelector('.add-on-name').textContent;
        const addOnMonthlyPrice = parseFloat(checkbox.dataset.monthlyPrice);
        const addOnYearlyPrice = parseFloat(checkbox.dataset.yearlyPrice);

        formData.addOns.push({
          name: addOnName,
          monthlyPrice: addOnMonthlyPrice,
          yearlyPrice: addOnYearlyPrice
        });

        const addOnPrice = formData.isYearly ? addOnYearlyPrice : addOnMonthlyPrice;
        const row = document.createElement('div');
        row.classList.add('summary-add-on-item');
        row.innerHTML = `
          <span>${addOnName}</span>
          <span>+$${addOnPrice}/${billingPeriodAbbr}</span>
        `;
        DOMElements.addOnSummaryContainer.appendChild(row);
      }
    });

    let total = planPrice;
    formData.addOns.forEach(addOn => {
      total += formData.isYearly ? addOn.yearlyPrice : addOn.monthlyPrice;
    });
    formData.totalPrice = total;

    DOMElements.totalBillingPeriod.textContent = formData.isYearly ? 'year' : 'month';
    DOMElements.totalPriceSummary.textContent = `$${total}/${billingPeriodAbbr}`;
  }

  // Initial step display and pricing
  showStep(currentStep);
  updatePricingUI();

  DOMElements.nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      let canProceed = false;

      if (currentStep === 0) {
        if (validateStep1()) {
          formData.personalInfo.name = DOMElements.nameInput.value;
          formData.personalInfo.email = DOMElements.emailInput.value;
          formData.personalInfo.phone = DOMElements.phoneInput.value;
          canProceed = true;
        }
      } else if (currentStep === 1) {
        if (validateStep2()) {
          canProceed = true;
        }
      } else if (currentStep === 2) {
        canProceed = true;
      }

      if (canProceed) {
        currentStep++;
        if (currentStep === SUMMARY_STEP_INDEX) {
          updateSummary();
        }
        showStep(currentStep);
      }
    });
  });

  DOMElements.prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  DOMElements.step1Form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      const formGroup = input.closest('.form-group');
      const errorSpan = formGroup.querySelector('.error-message');
      if (input.checkValidity()) {
        input.classList.remove('is-invalid');
        if (errorSpan) errorSpan.style.display = 'none';
      }
    });
  });

  DOMElements.planCards.forEach(card => {
    card.addEventListener('click', () => {
      DOMElements.planCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  DOMElements.billingToggle.addEventListener("change", function () {
    formData.isYearly = this.checked;
    updatePricingUI();
  });

  DOMElements.addOnCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      const card = this.closest('.add-on-card');
      card.classList.toggle('selected', this.checked);
    });
  });

  DOMElements.changePlanButton.addEventListener('click', () => {
    currentStep = 1;
    showStep(currentStep);
  });

  DOMElements.confirmButton.addEventListener('click', () => {
    currentStep = THANK_YOU_STEP_INDEX;
    showStep(currentStep);
    // In a real app, you'd send formData to a server here.
    console.log("Form Data Submitted:", formData);
  });

});
