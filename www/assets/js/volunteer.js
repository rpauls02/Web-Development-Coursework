document.addEventListener('DOMContentLoaded', () => {
    /* ======================================== Initialization ======================================== */

    initDateInput(document.querySelector('.date-input'));
    populateTimeSelectsFromShifts();
    setupFilters();
    setupShiftSelection();
    setupResetFilters();
    filterShifts();
});

/* ======================================== Filter Functions ======================================== */

function setupFilters() {
    const dateInput = document.querySelector('.date-input');
    const shiftSelect = document.getElementById('shift-select');
    const timeSelects = document.querySelectorAll('.time-select');

    if (dateInput) dateInput.addEventListener('change', filterShifts);
    if (shiftSelect) shiftSelect.addEventListener('change', filterShifts);
    if (timeSelects[0]) timeSelects[0].addEventListener('change', filterShifts);
    if (timeSelects[1]) timeSelects[1].addEventListener('change', filterShifts);
}

function setupResetFilters() {
    const resetBtn = document.querySelector('#filter-shifts-content button');

    if (!resetBtn) return;

    resetBtn.addEventListener('click', () => {
        const dateInput = document.querySelector('.date-input');
        const shiftSelect = document.getElementById('shift-select');
        const timeSelects = document.querySelectorAll('.time-select');

        if (dateInput) dateInput.value = getTodayISO();
        if (shiftSelect) shiftSelect.value = 'All';
        timeSelects.forEach(s => s.value = 'All');

        filterShifts();
    });
}

function filterShifts() {
    const dateInput = document.querySelector('.date-input');
    const shiftSelect = document.getElementById('shift-select');
    const timeSelects = document.querySelectorAll('.time-select');

    const selectedDate = dateInput?.value;
    const selectedShift = shiftSelect?.value;
    const selectedStartTime = timeSelects[0]?.value;
    const selectedEndTime = timeSelects[1]?.value;

    const shiftButtons = document.querySelectorAll('.shift-button');
    let visibleCount = 0;

    shiftButtons.forEach(btn => {
        let show = true;

        if (selectedDate && btn.dataset.shiftDate !== selectedDate) show = false;
        if (selectedShift !== 'All' && btn.dataset.shiftName !== selectedShift) show = false;
        if (selectedStartTime !== 'All' && btn.dataset.shiftStart !== selectedStartTime) show = false;
        if (selectedEndTime !== 'All' && btn.dataset.shiftEnd !== selectedEndTime) show = false;

        btn.style.display = show ? 'flex' : 'none';
        if (show) visibleCount++;
    });

    const shiftsList = document.getElementById('shifts-list');
    if (!shiftsList) return;

    let noShiftsMsg = shiftsList.querySelector('.no-shifts-message');

    if (visibleCount === 0 && !noShiftsMsg) {
        noShiftsMsg = document.createElement('p');
        noShiftsMsg.className = 'no-shifts-message';
        noShiftsMsg.textContent = 'No shifts available for selected filters.';
        shiftsList.appendChild(noShiftsMsg);
    }

    if (visibleCount > 0 && noShiftsMsg) {
        noShiftsMsg.remove();
    }
}

/* ==================================== Shift Selection Functions ==================================== */

function setupShiftSelection() {
    const shiftButtons = document.querySelectorAll('.shift-button');
    const confirmBtn = document.getElementById('confirm-signup-btn');
    const cancelBtn = document.getElementById('cancel-selection-btn');
    const shiftIdInput = document.getElementById('shift-id-input');

    let selectedShiftId = null;

    shiftButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            shiftButtons.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            selectedShiftId = btn.dataset.shiftId;

            // Update summary
            document.getElementById('summary-name').textContent = btn.dataset.shiftName;
            document.getElementById('summary-day').textContent = btn.dataset.shiftDay;
            document.getElementById('summary-date').textContent = formatDate(btn.dataset.shiftDate);
            document.getElementById('summary-start').textContent = btn.dataset.shiftStart;
            document.getElementById('summary-end').textContent = btn.dataset.shiftEnd;

            if (shiftIdInput) shiftIdInput.value = selectedShiftId;
            if (confirmBtn) confirmBtn.disabled = false;
        });
    });

    cancelBtn?.addEventListener('click', () => {
        shiftButtons.forEach(b => b.classList.remove('active'));

        // Clear summary
        document.getElementById('summary-name').textContent = '';
        document.getElementById('summary-day').textContent = '';
        document.getElementById('summary-date').textContent = '';
        document.getElementById('summary-start').textContent = '';
        document.getElementById('summary-end').textContent = '';

        if (shiftIdInput) shiftIdInput.value = '';
        if (confirmBtn) confirmBtn.disabled = true;

        selectedShiftId = null;
    });
}

/* ===================================== Time Select Functions ===================================== */

function populateTimeSelectsFromShifts() {
    const shiftButtons = document.querySelectorAll('.shift-button');
    const startTimeSelect = document.querySelectorAll('.time-select')[0];
    const endTimeSelect = document.querySelectorAll('.time-select')[1];
    const dateInput = document.querySelector('.date-input');

    if (!startTimeSelect || !endTimeSelect) return;

    const selectedDate = dateInput?.value;

    const filteredButtons = selectedDate
        ? Array.from(shiftButtons).filter(btn => btn.dataset.shiftDate === selectedDate)
        : Array.from(shiftButtons);

    const startTimes = new Set();
    const endTimes = new Set();

    filteredButtons.forEach(btn => {
        startTimes.add(btn.dataset.shiftStart);
        endTimes.add(btn.dataset.shiftEnd);
    });

    startTimeSelect.innerHTML =
        '<option value="All">All</option>' +
        [...startTimes].sort().map(t => `<option value="${t}">${t}</option>`).join('');

    endTimeSelect.innerHTML =
        '<option value="All">All</option>' +
        [...endTimes].sort().map(t => `<option value="${t}">${t}</option>`).join('');
}

/* =========================================== Helper Functions =========================================== */

function initDateInput(dateInput) {
    if (!dateInput) return;
    dateInput.value = '';
    dateInput.min = '';
    dateInput.max = '';
}

function getTodayISO() {
    return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}
