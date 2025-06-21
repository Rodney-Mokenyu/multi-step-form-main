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
        isYearly: false, // Default to monthly
        addOns: [], // Array of { name: '', monthlyPrice: 0, yearlyPrice: 0 }
        totalPrice: 0
    };

    // --- DOM Elements Cache ---
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

    // --- Constants ---
    const THANK_YOU_STEP_INDEX = DOMElements.steps.length - 1;
    const SUMMARY_STEP_INDEX = DOMElements.steps.length - 2;
    let currentStep = 0;

    // --- Utility Functions ---

    /**
     * Displays the current step and updates sidebar active state.
     * @param {number} index The index of the step to show.
     */
    function showStep(index) {
        DOMElements.steps.forEach((step, i) => {
            step.classList.toggle('active', i === index); // Use 'active' class for visibility
        });

        DOMElements.stepNumbers.forEach((stepNumber, i) => {
            stepNumber.classList.toggle('active', i === index); // Use 'active' class for background
        });

        // Hide navigation buttons on thank you step
        const formNavs = document.querySelectorAll('.form-navigation');
        formNavs.forEach(nav => {
            if (index === THANK_YOU_STEP_INDEX) {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'flex'; // Or 'block', depending on original flex context
            }
        });
    }

    /**
     * Validates Step 1 fields (Name, Email, Phone).
     * @returns {boolean} True if all fields are valid, false otherwise.
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
     * @returns {boolean} True if a plan is selected, false otherwise.
     */
    function validateStep2() {
        const selectedPlan = document.querySelector('.plan-card.selected');
        if (!selectedPlan) {
            alert('Please select a plan before proceeding.'); // Simple alert for now
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

        // Update Plan Card Prices and Promos
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

        // Update Add-on Prices
        DOMElements.addOnCheckboxes.forEach(checkbox => {
            const priceEl = checkbox.closest('.add-on-card').querySelector('.add-on-price');
            const monthlyPrice = checkbox.dataset.monthlyPrice;
            const yearlyPrice = checkbox.dataset.yearlyPrice;

            priceEl.textContent = `+$${isYearly ? yearlyPrice : monthlyPrice}/${period}`;
        });

        // Update billing option labels
        DOMElements.monthlyLabel.classList.toggle('active', !isYearly);
        DOMElements.yearlyLabel.classList.toggle('active', isYearly);
    }

    /**
     * Gathers all selected data and updates the summary on Step 4.
     */
    function updateSummary() {
        // Clear previous summary
        DOMElements.addOnSummaryContainer.innerHTML = '';
        formData.addOns = []; // Reset add-ons in data

        // Update plan details
        const selectedPlanCard = document.querySelector('.plan-card.selected');
        if (selectedPlanCard) {
            formData.plan.name = selectedPlanCard.dataset.plan;
            formData.plan.monthlyPrice = parseFloat(selectedPlanCard.dataset.monthlyPrice);
            formData.plan.yearlyPrice = parseFloat(selectedPlanCard.dataset.yearlyPrice);
        } else {
            // Should not happen if Step 2 validation is in place
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

        // Update add-ons
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
                row.classList.add('summary-add-on-item'); // Use the class for styling
                row.innerHTML = `
                    <span>${addOnName}</span>
                    <span>+$${addOnPrice}/${billingPeriodAbbr}</span>
                `;
                DOMElements.addOnSummaryContainer.appendChild(row);
            }
        });

        // Calculate Total Price
        let total = planPrice;
        formData.addOns.forEach(addOn => {
            total += formData.isYearly ? addOn.yearlyPrice : addOn.monthlyPrice;
        });
        formData.totalPrice = total;

        DOMElements.totalBillingPeriod.textContent = formData.isYearly ? 'year' : 'month';
        DOMElements.totalPriceSummary.textContent = `$${total}/${billingPeriodAbbr}`;
    }

    // --- Event Listeners and Navigation Logic ---

    // Initial step display
    showStep(currentStep);
    updatePricingUI(); // Set initial pricing display

    // Next Buttons
    DOMElements.nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            let canProceed = false;

            if (currentStep === 0) { // Step 1 validation
                if (validateStep1()) {
                    // Save personal info to formData
                    formData.personalInfo.name = DOMElements.nameInput.value;
                    formData.personalInfo.email = DOMElements.emailInput.value;
                    formData.personalInfo.phone = DOMElements.phoneInput.value;
                    canProceed = true;
                }
            } else if (currentStep === 1) { // Step 2 validation
                if (validateStep2()) {
                    canProceed = true;
                }
            } else if (currentStep === 2) { // Step 3
                canProceed = true; // Add-ons are optional, no specific validation
            }

            if (canProceed) {
                currentStep++;
                if (currentStep === SUMMARY_STEP_INDEX) {
                    updateSummary(); // Populate summary before showing step 4
                }
                showStep(currentStep);
            }
        });
    });

    // Previous Buttons
    DOMElements.prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // Step 1: Auto-hide error on input
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

    // Step 2: Plan Card Selection
    DOMElements.planCards.forEach(card => {
        card.addEventListener('click', () => {
            DOMElements.planCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // Step 2: Billing Toggle
    DOMElements.billingToggle.addEventListener("change", function () {
        formData.isYearly = this.checked;
        updatePricingUI(); // Update all plan/add-on prices in UI
    });

    // Step 3: Add-on Checkbox Visual Feedback
    DOMElements.addOnCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const card = this.closest('.add-on-card');
            card.classList.toggle('selected', this.checked); // Use 'selected' class for consistency
        });
    });

    // Step 4: Change Plan Button
    DOMElements.changePlanButton.addEventListener('click', () => {
        currentStep = 1; // Go back to Step 2 (Select Plan)
        showStep(currentStep);
    });

    // Confirm Button
    DOMElements.confirmButton.addEventListener('click', () => {
        currentStep = THANK_YOU_STEP_INDEX;
        showStep(currentStep);
        // In a real app, you'd send formData to a server here.
        console.log("Form Data Submitted:", formData);
    });

});