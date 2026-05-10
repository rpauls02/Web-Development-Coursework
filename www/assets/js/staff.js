document.addEventListener('DOMContentLoaded', () => {
    /* =================================== Navigation & Breadcrumbs =================================== */
    const welcomeContent = document.getElementById('welcome-content');
    const breadcrumbSection = document.getElementById('breadcrumb-section');
    const breadcrumbAction = document.getElementById('breadcrumb-action');

    const mainNavItems = document.querySelectorAll('.main-nav .nav-item');
    const subNavs = document.querySelectorAll('.sub-nav');
    const subNavItems = document.querySelectorAll('.sub-nav .nav-item');

    const signupItems = document.querySelectorAll('.sub-nav .signup-item');

    const mainNavMapping = {
        'manage-opening-hours-mn-item': 'manage-open-hours-sub-nav',
        'manage-shifts-mn-item': 'manage-shifts-sub-nav',
        'view-signups-mn-item': 'view-signups-sub-nav',
    };

    const subNavItemMapping = {
        'create-open-hours-sn-item': 'create-open-hours-content',
        'edit-open-hours-sn-item': 'edit-open-hours-content',
        'create-shifts-sn-item': 'create-shifts-content',
        'edit-shifts-sn-item': 'edit-shifts-content',
        'view-signups-mn-item': 'view-signups-content'
    };

    const breadcrumbMap = {
        'create-open-hours-sn-item': { section: 'Manage Opening Hours', action: 'Add Opening Hours' },
        'edit-open-hours-sn-item': { section: 'Manage Opening Hours', action: 'Edit Opening Hours' },
        'create-shifts-sn-item': { section: 'Manage Shifts', action: 'Add Shifts' },
        'edit-shifts-sn-item': { section: 'Manage Shifts', action: 'Edit Shifts' },
        'view-signups-mn-item': { section: 'View Signups', action: 'View Signups' }
    };

    /* ==================================== Navigation Functions ==================================== */
    function hideAllSubNavs() {
        subNavs.forEach(nav => nav.style.display = 'none');
    }

    function hideAllContent() {
        Object.values(subNavItemMapping).forEach(contentId => {
            const el = document.getElementById(contentId);
            if (el) el.style.display = 'none';
        });
    }

    function clearMainNavActive() {
        mainNavItems.forEach(item => item.classList.remove('active', 'open'));
    }

    function clearSubNavActive() {
        subNavItems.forEach(item => item.classList.remove('active', 'open'));
    }

    function clearBreadcrumb() {
        if (breadcrumbSection) breadcrumbSection.textContent = '';
        if (breadcrumbAction) breadcrumbAction.textContent = '';
    }

    mainNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSubNavId = mainNavMapping[item.id];
            const isOpen = item.classList.contains('open');

            clearMainNavActive();
            hideAllSubNavs();
            hideAllContent();
            clearSubNavActive();

            if (!isOpen) {
                // Open clicked main nav
                item.classList.add('active', 'open');

                // Show sub-nav if exists
                if (targetSubNavId) {
                    const subNav = document.getElementById(targetSubNavId);
                    if (subNav) subNav.style.display = 'flex';
                }

                // Show content if it’s a main nav without sub-nav (like view-signups)
                if (item.id === 'view-signups-mn-item') {
                    const content = document.getElementById('view-signups-content');
                    const dateInput = content?.querySelector('.date-input');

                    if (content) content.style.display = 'flex';

                    if (dateInput?.value) {
                        renderSignupsTable(dateInput.value);
                    }
                }

                // Update breadcrumb if needed
                if (breadcrumbMap[item.id]) {
                    breadcrumbSection.textContent = breadcrumbMap[item.id].section;
                    breadcrumbAction.textContent = breadcrumbMap[item.id].action;
                }

                if (welcomeContent) welcomeContent.style.display = 'none';
            } else {
                // Clicking an open main nav → close it
                if (welcomeContent) welcomeContent.style.display = 'flex';
                clearBreadcrumb();
            }
        });
    });

    subNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const contentId = subNavItemMapping[item.id];
            if (!contentId) return;

            // Highlight clicked sub-nav
            clearSubNavActive();
            item.classList.add('active');

            // Show content
            hideAllContent();
            const contentEl = document.getElementById(contentId);
            if (contentEl) contentEl.style.display = 'flex';

            // Update breadcrumb
            if (breadcrumbMap[item.id]) {
                breadcrumbSection.textContent = breadcrumbMap[item.id].section;
                breadcrumbAction.textContent = breadcrumbMap[item.id].action;
            }

            // Hide welcome content
            if (welcomeContent) welcomeContent.style.display = 'none';
        });
    });

    /* =================================== Input and Select Elements =================================== */

    // Initialize date inputs with current week
    document.querySelectorAll('.date-input').forEach(dp => {
        const today = getTodayISO();
        const monday = getMondayForWeek(today);
        dp.value = monday;
        dp.min = today;

        // Initial render using today
        if (dp.closest('#create-open-hours-content')) renderCreateOpenHoursTable(monday);
        if (dp.closest('#edit-open-hours-content')) renderEditOpenHoursTable(monday);
        if (dp.closest('#create-shifts-content')) renderCreateShiftsTable(monday);
        if (dp.closest('#edit-shifts-content')) renderEditShiftsTable(monday);
        if (dp.closest('#view-signups-content')) renderSignupsTable(monday);

        // Update when user changes date — **use the same logic as open hours**
        dp.addEventListener('change', () => {
            const monday = getMondayForWeek(dp.value);
            dp.value = monday;

            if (dp.closest('#create-open-hours-content')) renderCreateOpenHoursTable(monday);
            if (dp.closest('#edit-open-hours-content')) renderEditOpenHoursTable(monday);
            if (dp.closest('#create-shifts-content')) renderCreateShiftsTable(monday);
            if (dp.closest('#edit-shifts-content')) renderEditShiftsTable(monday);
            if (dp.closest('#view-signups-content')) renderSignupsTable(monday);
        });
    });

    // Populate time inputs with AM/PM times
    populateTimeSelect(document.getElementById('create-open-hours-table'))
    populateTimeSelect(document.getElementById('create-shifts-table'))
});

/* ======================================== Opening Hours Functions ======================================== */

/* ====================================== Add Opening Hours ====================================== */

// Renders dates for each day of selected week, only if opening hours don't already exist.
async function renderCreateOpenHoursTable(date) {
    const formattedDate = convertDateFormat(date);

    const content = document.getElementById('create-open-hours-content');
    const dateInput = content.querySelector('.date-input');
    const messagePnl = content.querySelector('.message-panel');
    const table = content.querySelector('#create-open-hours-table');
    const tbody = table.querySelector('tbody');
    const submitBtn = content.querySelector('#submit-open-hours');

    try {
        const res = await fetch(`/api/openhours?date=${formattedDate}`);
        const data = await res.json();

        const hasHours = data.open_hours && data.open_hours.length > 0;

        if (hasHours) {
            messagePnl.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                <p><strong>Opening hours already exist for the selected week.</strong></p>
                <p><strong>To create new opening hours, select a different week.</strong></p>
                <p><strong>To edit existing opening hours, go to Opening Hours → Edit Opening Hours and select the desired week.</strong></p>
            `;
            messagePnl.style.display = 'block';
            messagePnl.style.backgroundColor = 'orange';
            submitBtn.style.display = 'none';
        } else {
            messagePnl.style.display = 'none';
            submitBtn.style.display = 'block';
        }

        const weekByDay = getWeekByDay(date);

        tbody.querySelectorAll('tr').forEach(row => {
            const dayName = row.cells[0].innerText;
            const isoDate = weekByDay[dayName];

            const dateCell = row.querySelector('.date');
            dateCell.textContent = formatDisplayDate(isoDate);
            dateCell.dataset.iso = isoDate;

            row.querySelectorAll('select').forEach(sel => {
                sel.disabled = hasHours;
                if (!hasHours) sel.innerHTML = 'Closed';
            });
        });

        if (!hasHours) populateTimeSelect(table);

    } catch (err) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-xmark"></i>
            <p><strong>Could not retrieve open hours for w/b ${dateInput.value}.</strong></p>
            <p><strong>${err.message}</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'red';
    }
}

// Submit user input for creating opening hours to controller
async function submitOpenHours() {
    const content = document.getElementById('create-open-hours-content');
    const dateInput = content.querySelector('.date-input');
    const messagePnl = content.querySelector('.message-panel');
    const table = content.querySelector('#create-open-hours-table');
    const tbody = table.querySelector('tbody');

    const openHoursData = [];

    tbody.querySelectorAll('tr').forEach(row => {
        const dateCell = row.querySelector('.date');
        const openSelect = row.querySelector('.open-select');
        const closeSelect = row.querySelector('.close-select');

        const isoDate = dateCell.dataset.iso;

        const openValue = openSelect.value.trim();
        const closeValue = closeSelect.value.trim();

        const openTime = openValue === 'Closed' || !openValue ? null : openValue + ':00';
        const closeTime = closeValue === 'Closed' || !closeValue ? null : closeValue + ':00';

        if (openTime === null && closeTime === null) return;

        openHoursData.push({
            date: isoDate,
            open: openTime,
            close: closeTime
        });
    });

    if (openHoursData.length === 0) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-exclamation"></i>
            <p><strong>Select open hours to be uploaded.</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'orange';
        return;
    }

    try {
        const res = await fetch('/api/openhours/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ openhours: openHoursData })
        });

        if (!res.ok) throw new Error(data.error || 'Unexpected error');

        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <p><strong>Opening hours uploaded successfully for w/b ${dateInput.value}</strong></p>
            <p><strong>To create more opening hours, select another date above.</strong></p>
            <p><strong>To view, go to Opening Hours → Edit Opening Hours and select the desired week.</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'green';

        tbody.querySelectorAll('tr').forEach(row => {
            row.querySelectorAll('select').forEach(sel => sel.disabled = true);
        });

    } catch (err) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-xmark"></i>
            <p><strong>Unable to upload opening hours for w/b ${dateInput.value}</strong></p>
            <p><strong>${err.message}</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'red';
    }
}

/* ===================================== Edit Opening Hours ===================================== */

// Renders opening hours on table for the week retrieved from the selected date
async function renderEditOpenHoursTable(date) {
    const formattedDate = convertDateFormat(date);

    const content = document.getElementById('edit-open-hours-content');
    const dateInput = content.querySelector('.date-input');
    const messagePnl = content.querySelector('.message-panel');
    const table = content.querySelector('#edit-open-hours-table');
    const tbody = table.querySelector('tbody');
    const tableUtils = content.querySelector('.table-utils');

    try {
        const res = await fetch(`/api/openhours?date=${formattedDate}`);
        const data = await res.json();

        const openHours = Array.isArray(data.open_hours) ? data.open_hours : [];
        const hasHours = openHours.length > 0;

        if (!hasHours) {
            messagePnl.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                <p><strong>No opening hours were found for the selected week.</strong></p>
                <p><strong>To create opening hours, go to Opening Hours → Create Opening Hours and select the desired week</strong></p>
            `;
            messagePnl.style.display = 'block';
            messagePnl.style.backgroundColor = 'orange';
            tableUtils.style.display = 'none';
        } else {
            tableUtils.style.display = 'block';
            messagePnl.style.display = 'none';
        }

        const weekByDay = getWeekByDay(date);
        const byDay = mapItemsByDay(openHours, 'date', null, true);

        tbody.querySelectorAll('tr').forEach(row => {
            const dayName = row.cells[0].innerText;
            const isoDate = weekByDay[dayName];

            const dateCell = row.querySelector('.date');
            dateCell.dataset.iso = isoDate;
            dateCell.textContent = formatDisplayDate(isoDate);

            const dayRecord = byDay[dayName];

            const openText = hasHours && dayRecord?.open && !dayRecord.open.startsWith('00:00')
                ? dayRecord.open.slice(0, 5)
                : 'Closed';
            const closeText = hasHours && dayRecord?.close && !dayRecord.close.startsWith('00:00')
                ? dayRecord.close.slice(0, 5)
                : 'Closed';

            row.querySelector('.open-time').textContent = openText;
            row.querySelector('.close-time').textContent = closeText;
            row.dataset.originalOpen = openText;
            row.dataset.originalClose = closeText;
        });
    } catch (err) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-xmark"></i>
            <p><strong>Could not retrieve open hours for w/b ${dateInput.value}.</strong></p>
            <p><strong>${err.message}</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'red';
    }
}

// Toggle editing of opening hours when "Edit opening hours" button is clicked
function toggleEditOpenHours() {
    const content = document.getElementById('edit-open-hours-content')
    const tableUtils = content.querySelector('.table-utils');
    const editUtils = content.querySelector('.edit-table-utils');
    const tbody = content.querySelector('tbody');
    const messagePnl = content.querySelector('.message-panel');
    const submitBtn = content.querySelector('.submit-changes-button');
    const isEditing = editUtils.style.display === 'block';

    if (!isEditing) {
        tableUtils.style.display = 'none';
        editUtils.style.display = 'block';

        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-exclamation"></i>
            <p><strong>Now editing opening hours for the selected week.</strong></p>
            <p><strong>When done, click "Submit changes" to confirm your changes.</strong></p>
            <p><strong>To cancel, click the 'Cancel' button.</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'orange';

        const originalValues = [];

        tbody.querySelectorAll('tr').forEach(row => {
            const openCell = row.querySelector('.open-time');
            const closeCell = row.querySelector('.close-time');

            const originalOpen = row.dataset.originalOpen || 'Closed';
            const originalClose = row.dataset.originalClose || 'Closed';

            originalValues.push({ originalOpen, originalClose });

            openCell.textContent = '';
            closeCell.textContent = '';

            const openSelect = document.createElement('select');
            openSelect.classList.add('open-select');

            const closeSelect = document.createElement('select');
            closeSelect.classList.add('close-select');

            openCell.appendChild(openSelect);
            closeCell.appendChild(closeSelect);
        });

        populateTimeSelect(tbody.closest('table'));

        tbody.querySelectorAll('tr').forEach((row, idx) => {
            const openSelect = row.querySelector('.open-select');
            const closeSelect = row.querySelector('.close-select');

            openSelect.value = originalValues[idx].originalOpen;
            closeSelect.value = originalValues[idx].originalClose;
        });
    } else {
        tableUtils.style.display = 'block';
        editUtils.style.display = 'none';
        messagePnl.style.display = 'none';

        tbody.querySelectorAll('tr').forEach(row => {
            const openCell = row.querySelector('.open-time');
            const closeCell = row.querySelector('.close-time');

            const originalOpen = row.dataset.originalOpen || 'Closed';
            const originalClose = row.dataset.originalClose || 'Closed';

            openCell.textContent = originalOpen;
            closeCell.textContent = originalClose;
        });

        submitBtn.dataset.confirming = 'false';
        submitBtn.textContent = 'Submit changes';
    }
}

// Upload edited opening hours
async function submitOpenHoursChanges() {
    const content = document.getElementById('edit-open-hours-content');
    const dateInput = content.querySelector('.date-input');
    const messagePnl = content.querySelector('.message-panel');
    const table = content.querySelector('#edit-open-hours-table');
    const tbody = table.querySelector('tbody');

    const updates = [];

    tbody.querySelectorAll('tr').forEach(row => {
        const isoDate = row.querySelector('.date').dataset.iso;
        const openSelect = row.querySelector('.open-select');
        const closeSelect = row.querySelector('.close-select');

        const open = openSelect ? openSelect.value : row.dataset.originalOpen;
        const close = closeSelect ? closeSelect.value : row.dataset.originalClose;

        if (open !== row.dataset.originalOpen || close !== row.dataset.originalClose) {
            updates.push({
                date: isoDate,
                open: open === 'Closed' ? null : open + ':00',
                close: close === 'Closed' ? null : close + ':00'
            });
        }
    });

    if (updates.length === 0) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-exclamation"></i>
            <p><strong>No changes were detected.</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'orange';
        return;
    }

    try {
        const res = await fetch('/api/openhours/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ openhours: updates })
        });

        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

        tbody.querySelectorAll('tr').forEach(row => {
            const openSelect = row.querySelector('.open-select');
            const closeSelect = row.querySelector('.close-select');

            if (openSelect && closeSelect) {
                const openCell = row.querySelector('.open-time');
                const closeCell = row.querySelector('.close-time');

                const openValue = openSelect.value;
                const closeValue = closeSelect.value;

                openCell.textContent = openValue;
                closeCell.textContent = closeValue;

                row.dataset.originalOpen = openValue;
                row.dataset.originalClose = closeValue;
            }
        });

        toggleEditOpenHours();

        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <p><strong>Opening hours updated successfully for w/b ${dateInput.value}</strong></p>
            <p><strong>To update more opening hours, select another date above.</strong></p>
            <p><strong>To view, select the desired week again.</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'green';

    } catch (err) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-xmark"></i>
            <p><strong>Unable to update hours for w/b ${dateInput.value}</strong></p>
            <p><strong>${err.message}</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'red';
    }
}


/* ============================================ Shifts Functions =========================================== */

/* =============================================== Add Shifts ============================================== */

// Renders dates for each day of selected week, only if opening hours exist
let isRenderingCreateShifts = false;

async function renderCreateShiftsTable(date) {
    if (isRenderingCreateShifts) return;
    isRenderingCreateShifts = true;

    const content = document.getElementById('create-shifts-content');
    const dateInput = content.querySelector('.date-input');
    const messagePnl = content.querySelector('.message-panel');
    const table = content.querySelector('#create-shifts-table');
    const tbody = table.querySelector('tbody');
    const submitBtn = content.querySelector('#submit-shifts');

    try {
        messagePnl.style.display = 'none';
        submitBtn.style.display = 'none';

        // Reset table
        tbody.querySelectorAll('tr').forEach(row => {
            row.querySelector('.date').textContent = '-';
            row.querySelectorAll('select').forEach(sel => {
                sel.innerHTML = '';
                sel.disabled = true;
            });
        });

        // Get week from selected date
        const weekByDay = getWeekByDay(date);

        // Fetch opening hours
        const formattedDate = convertDateFormat(date);
        const openRes = await fetch(`/api/openhours?date=${formattedDate}`);
        if (!openRes.ok) throw new Error('Failed to fetch opening hours');
        const openHoursData = await openRes.json();

        // Map open hours by weekday name
        const openHoursByDay = mapItemsByDay(openHoursData.open_hours || [], 'date', null, true);

        // Check if **all days of the week** have opening hours
        const missingDays = Object.keys(weekByDay).filter(day => !openHoursByDay[day]);
        if (missingDays.length > 0) {
            messagePnl.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                <p><strong>Opening hours must exist for the selected week to create shifts.</strong></p>
                <p><strong>To create opening hours, go to Opening Hours → Create Opening Hours and select the desired week.</strong></p>
            `;
            messagePnl.style.display = 'block';
            messagePnl.style.backgroundColor = 'orange';
            submitBtn.style.display = 'none';
            return;
        }

        // Fetch existing shifts
        const shiftsRes = await fetch(`/api/shifts?date=${formattedDate}`);
        if (!shiftsRes.ok) throw new Error('Failed to fetch shifts');
        const shiftsData = await shiftsRes.json();
        const hasShifts = Array.isArray(shiftsData.shifts) && shiftsData.shifts.length > 0;

        if (hasShifts) {
            messagePnl.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                <p><strong>Shifts already exist for the selected week.</strong></p>
                <p><strong>To create new shifts, select a different week.</strong></p>
                <p><strong>To edit existing shifts, go to Shifts → Edit Shifts and select the desired week.</strong></p>
            `;
            messagePnl.style.display = 'block';
            messagePnl.style.backgroundColor = 'orange';
            return;
        }

        // If we reach here → opening hours exist, no shifts yet
        messagePnl.style.display = 'none';
        submitBtn.style.display = 'block';

        // Populate table with week dates
        tbody.querySelectorAll('tr').forEach(row => {
            const dayName = row.cells[0].innerText;
            const isoDate = weekByDay[dayName];

            const dateCell = row.querySelector('.date');
            dateCell.textContent = formatDisplayDate(isoDate);
            dateCell.dataset.iso = isoDate;

            row.querySelectorAll('select').forEach(sel => {
                sel.disabled = false;
                sel.innerHTML = 'None';
            });
        });

        // Populate time dropdowns
        populateTimeSelect(table);

    } catch (err) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-xmark"></i>
            <p><strong>Could not retrieve shifts for w/b ${dateInput.value}.</strong></p>
            <p><strong>${err.message}</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'red';
        submitBtn.style.display = 'none';
    } finally {
        isRenderingCreateShifts = false;
    }
}

// Submit user input for creating shifts to controller
async function submitShifts() {
    const content = document.getElementById('create-shifts-content');
    const dateInput = content.querySelector('.date-input');
    const messagePnl = content.querySelector('.message-panel');
    const table = content.querySelector('#create-shifts-table');
    const tbody = table.querySelector('tbody');

    const newShifts = [];

    tbody.querySelectorAll('tr').forEach(row => {
        const isoDate = row.querySelector('.date').dataset.iso;
        const cells = row.querySelectorAll('td.shift-cell');

        cells.forEach(cell => {
            const startSel = cell.querySelector('.start-select');
            const endSel = cell.querySelector('.end-select');

            const start = startSel.value === 'None' ? null : startSel.value;
            const end = endSel.value === 'None' ? null : endSel.value;

            if (!start && !end) return;

            const colIndex = cell.cellIndex;
            const name = table
                .querySelector(`thead th:nth-child(${colIndex + 1})`)
                .innerText
                .trim();

            console.log('Column Index:', colIndex, 'Name:', name);

            newShifts.push({
                date: isoDate,
                name,
                start,
                end
            });
        });
    });

    if (newShifts.length === 0) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-exclamation"></i>
            <p><strong>Select shifts to be uploaded.</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'orange';
        return;
    }

    const overlapErrors = validateShiftOverlaps(newShifts);

    if (overlapErrors.length > 0) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-exclamation"></i>
            ${overlapErrors.map(e => `<p><strong>${e}</strong></p>`).join('')}
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'orange';
        return;
    }

    try {
        const res = await fetch('/api/shifts/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shifts: newShifts })
        });

        if (!res.ok) throw new Error('Unexpected error');

        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <p><strong>Shifts uploaded successfully for w/b ${dateInput.value}</strong></p>
            <p><strong>To create more shifts, select another date above.</strong></p>
            <p><strong>To view, go to Shifts → Edit Shifts and select the desired week.</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'green';

    } catch (err) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-xmark"></i>
            <p><strong>Unable to upload shifts for w/b ${dateInput.value}</strong></p>
            <p><strong>${err.message}</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'red';
    }
}

/* ============================================== Edit Shifts ============================================== */

// Render shifts on table for the week retrieved from the selected date
async function renderEditShiftsTable(date) {
    const formattedDate = convertDateFormat(date);

    const content = document.getElementById('edit-shifts-content');
    const dateInput = content.querySelector('.date-input');
    const messagePnl = content.querySelector('.message-panel');
    const table = content.querySelector('#edit-shifts-table');
    const tbody = table.querySelector('tbody');
    const tableUtils = content.querySelector('.table-utils');

    try {
        const res = await fetch(`/api/shifts?date=${formattedDate}`);
        const data = await res.json();

        const shifts = Array.isArray(data.shifts) ? data.shifts : [];
        const hasShifts = shifts.length > 0;

        if (!hasShifts) {
            messagePnl.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                <p><strong>No shifts were found for the selected week.</strong></p>
                <p><strong>To create shifts for the selected week, go to Shifts → Create Shifts and select the desired week.</strong></p>
            `;
            messagePnl.style.display = 'block';
            messagePnl.style.backgroundColor = 'orange';
            tableUtils.style.display = 'none';
        } else {
            messagePnl.style.display = 'none';
            tableUtils.style.display = 'block';
        }

        const weekByDay = getWeekByDay(date);
        const byDay = mapItemsByDay(data.shifts || [], 'date', 'name', true);
        const shiftNames = ['Yellow Shift', 'Blue Shift', 'Orange Shift', 'Purple Shift'];

        tbody.querySelectorAll('tr').forEach(row => {
            const dayName = row.cells[0].innerText;
            const isoDate = weekByDay[dayName];

            const dateCell = row.querySelector('.date');
            dateCell.dataset.iso = isoDate;
            dateCell.textContent = formatDisplayDate(isoDate);

            shiftNames.forEach((name, i) => {
                const cell = row.cells[i + 2];
                const shift = byDay[dayName]?.[name];

                let displayText = hasShifts && shift
                    ? `${shift.start?.slice(0, 5) || 'None'} - ${shift.end?.slice(0, 5) || 'None'}`
                    : '-';

                cell.textContent = displayText;
                cell.dataset.originalStart = shift?.start?.slice(0, 5) || 'None';
                cell.dataset.originalEnd = shift?.end?.slice(0, 5) || 'None';
            });
        });

    } catch (err) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-xmark"></i>
            <p><strong>Could not retrieve shifts for w/b ${dateInput.value}.</strong></p>
            <p><strong>${err.message}</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'red';
    }
}


function toggleEditShifts() {
    const content = document.getElementById('edit-shifts-content')
    const tableUtils = content.querySelector('.table-utils');
    const editUtils = content.querySelector('.edit-table-utils');
    const tbody = content.querySelector('tbody');
    const messagePnl = content.querySelector('.message-panel');
    const submitBtn = content.querySelector('.submit-changes-button');
    const isEditing = editUtils.style.display === 'block';

    if (!isEditing) {
        tableUtils.style.display = 'none';
        editUtils.style.display = 'block';

        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-exclamation"></i>
            <p><strong>Now editing shifts for the selected week.</strong></p>
            <p><strong>When done, click "Submit changes" to confirm your changes.</strong></p>
            <p><strong>To cancel, click the 'Cancel' button.</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'orange';

        const originalValues = [];

        tbody.querySelectorAll('tr').forEach(row => {
            for (let i = 2; i <= 5; i++) {
                const cell = row.cells[i];

                const originalStart = cell.dataset.originalStart || 'None';
                const originalEnd = cell.dataset.originalEnd || 'None';
                originalValues.push({ originalStart, originalEnd });

                cell.textContent = '';

                const startSelect = document.createElement('select');
                startSelect.classList.add('start-select');

                const endSelect = document.createElement('select');
                endSelect.classList.add('end-select');

                cell.appendChild(startSelect);
                cell.appendChild(document.createTextNode(' - '));
                cell.appendChild(endSelect);
            }
        });

        populateTimeSelect(tbody.closest('table'));

        let valueIdx = 0;
        tbody.querySelectorAll('tr').forEach(row => {
            for (let i = 2; i <= 5; i++) {
                const cell = row.cells[i];
                const startSelect = cell.querySelector('.start-select');
                const endSelect = cell.querySelector('.end-select');

                startSelect.value = originalValues[valueIdx].originalStart;
                endSelect.value = originalValues[valueIdx].originalEnd;
                valueIdx++;
            }
        });
    } else {
        tableUtils.style.display = 'block';
        editUtils.style.display = 'none';
        messagePnl.style.display = 'none';

        tbody.querySelectorAll('tr').forEach(row => {
            for (let i = 2; i <= 5; i++) {
                const cell = row.cells[i];
                const originalStart = cell.dataset.originalStart || 'None';
                const originalEnd = cell.dataset.originalEnd || 'None';
                cell.textContent = `${originalStart} - ${originalEnd}`;
            }
        });

        submitBtn.dataset.confirming = 'false';
        submitBtn.textContent = 'Submit changes';
    }
}

// Upload edited shifts
async function submitShiftsChanges() {
    const content = document.getElementById('edit-shifts-content');
    const dateInput = content.querySelector('.date-input');
    const messagePnl = content.querySelector('.message-panel');
    const table = content.querySelector('#edit-shifts-table');
    const tbody = table.querySelector('tbody');

    const updates = [];
    const shiftNames = ['Yellow Shift', 'Blue Shift', 'Orange Shift', 'Purple Shift'];

    tbody.querySelectorAll('tr').forEach(row => {
        if (!row.querySelector('.date')) return;
        const isoDate = row.querySelector('.date').dataset.iso;

        shiftNames.forEach((name, i) => {
            const cell = row.cells[i + 2];
            const startSelect = cell.querySelector('.start-select');
            const endSelect = cell.querySelector('.end-select');

            const start = startSelect ? startSelect.value : cell.dataset.originalStart;
            const end = endSelect ? endSelect.value : cell.dataset.originalEnd;

            if (start !== cell.dataset.originalStart || end !== cell.dataset.originalEnd) {
                updates.push({ date: isoDate, name, start, end });
            }
        });
    });

    if (updates.length === 0) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-exclamation"></i>
            <p><strong>No changes were detected.</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'orange';
        return;
    }

    try {
        const res = await fetch('/api/shifts/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates })
        });

        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

        // Update table and datasets
        tbody.querySelectorAll('tr').forEach(row => {
            if (!row.querySelector('.date')) return;
            shiftNames.forEach((name, i) => {
                const cell = row.cells[i + 2];
                const startSelect = cell.querySelector('.start-select');
                const endSelect = cell.querySelector('.end-select');

                if (startSelect && endSelect) {
                    const start = startSelect.value;
                    const end = endSelect.value;

                    cell.dataset.originalStart = start;
                    cell.dataset.originalEnd = end;
                    cell.textContent = `${start} - ${end}`;
                }
            });
        });

        toggleEditShifts();

        messagePnl.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <p><strong>Shifts updated successfully for w/b ${dateInput.value}</strong></p>
            <p><strong>To update more shifts, select another date above.</strong></p>
            <p><strong>To view, select the desired week again.</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'green';

    } catch (err) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-xmark"></i>
            <p><strong>Unable to update shifts for w/b ${dateInput.value}</strong></p>
            <p><strong>${err.message}</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'red';
    }
}


/* ============================================== View Signups ============================================== */

async function renderSignupsTable(date) {
    const content = document.getElementById('view-signups-content');
    const table = content.querySelector('#view-signups-table');
    const tbody = table.querySelector('tbody');
    const messagePnl = content.querySelector('.message-panel');

    try {
        const formattedDate = getMondayForWeek(date); // ISO YYYY-MM-DD for backend
        const res = await fetch(`/api/shifts?date=${formattedDate}&includeSignups=1`);
        const data = await res.json();

        const shifts = Array.isArray(data.shifts) ? data.shifts : [];
        const weekByDay = getWeekByDay(date);
        const byDay = {};
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        tbody.innerHTML = ''; // clear previous rows

        // Group shifts by weekday
        shifts.forEach(shift => {
            const dayName = Object.keys(weekByDay).find(d => weekByDay[d] === shift.date);
            if (!dayName) return;
            if (!byDay[dayName]) byDay[dayName] = [];
            byDay[dayName].push(shift);
        });

        const hasAnyShift = Object.values(byDay).some(arr => arr.length > 0);

        if (!hasAnyShift) {
            messagePnl.innerHTML = `
                <i class="fa-solid fa-circle-exclamation"></i>
                <p><strong>No shifts exist for the selected week.</strong></p>
                <p><strong>To create shifts, go to Shifts → Create Shifts and select the desired week.</strong></p>
            `;
            messagePnl.style.display = 'block';
            messagePnl.style.backgroundColor = 'orange';
        } else {
            messagePnl.style.display = 'none';
        }

        // Render all days
        daysOfWeek.forEach(dayName => {
            const isoDate = weekByDay[dayName];
            const dayShifts = byDay[dayName] || [];

            if (dayShifts.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="day">${dayName}</td>
                    <td class="date" data-iso="${isoDate}">${formatDisplayDate(isoDate)}</td>
                    <td class="time">-</td>
                    <td class="shift-name">-</td>
                    <td class="volunteers">-</td>
                `;
                tbody.appendChild(row);
            } else {
                dayShifts.forEach((shift, index) => {
                    const row = document.createElement('tr');

                    if (index === 0) {
                        const dayCell = document.createElement('td');
                        dayCell.className = 'day';
                        dayCell.textContent = dayName;
                        dayCell.rowSpan = dayShifts.length;
                        row.appendChild(dayCell);

                        const dateCell = document.createElement('td');
                        dateCell.className = 'date';
                        dateCell.dataset.iso = isoDate;
                        dateCell.textContent = formatDisplayDate(isoDate);
                        dateCell.rowSpan = dayShifts.length;
                        row.appendChild(dateCell);
                    }

                    // Time
                    const timeCell = document.createElement('td');
                    timeCell.className = 'time';
                    const start = shift.start?.slice(0, 5) ?? '-';
                    const end = shift.end?.slice(0, 5) ?? '-';
                    timeCell.textContent = `${start} - ${end}`;
                    row.appendChild(timeCell);

                    // Shift name
                    const shiftCell = document.createElement('td');
                    shiftCell.className = 'shift-name';
                    shiftCell.textContent = shift.name ?? '-';
                    row.appendChild(shiftCell);

                    // Volunteers
                    const volunteersCell = document.createElement('td');
                    volunteersCell.className = 'volunteers';
                    const volunteersArr = [];
                    if (shift.volunteer1) volunteersArr.push(shift.volunteer1);
                    if (shift.volunteer2) volunteersArr.push(shift.volunteer2);
                    volunteersCell.innerHTML = volunteersArr.length ? volunteersArr.join('<br>') : '-';
                    row.appendChild(volunteersCell);

                    tbody.appendChild(row);
                });
            }
        });

    } catch (err) {
        messagePnl.innerHTML = `
            <i class="fa-solid fa-xmark"></i>
            <p><strong>Failed to load shifts for the selected week.</strong></p>
            <p><strong>${err?.message || err}</strong></p>
        `;
        messagePnl.style.display = 'block';
        messagePnl.style.backgroundColor = 'red';
    }
}

/* =========================================== Helper Functions =========================================== */

// Returns today in ISO format (yyyy-mm-dd)
function getTodayISO() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Returns Monday of the week for a given date (ISO format)
function getMondayForWeek(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay(); // Sunday = 0, Monday = 1
    const diff = day === 0 ? -6 : 1 - day; // shift Sunday to previous Monday
    date.setDate(date.getDate() + diff);
    return date.toISOString().split('T')[0]; // ISO for backend
}

// Returns the full week from a given date
function getWeekFromDate(date) {
    const inputDate = new Date(date);
    const day = inputDate.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const week = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(inputDate);
        d.setDate(inputDate.getDate() + mondayOffset + i);
        week.push({
            day: d.toLocaleDateString('en-GB', { weekday: 'long' }),
            date: d.toISOString().split('T')[0]
        });
    }
    return week;
}

// Returns the week by a given day
function getWeekByDay(date) {
    const week = getWeekFromDate(date);
    if (!week) return {};

    const weekByDay = {};
    week.forEach(d => {
        weekByDay[d.day] = d.date;
    });

    return weekByDay;
}

function convertDateFormat(date) {
    if (!date) return null;

    return date.replace(/-/g, '');
}

function mapItemsByDay(items = [], dayKey = 'day', subKey = null, useWeekdayName = false) {
    const byDay = {};

    items.forEach(item => {
        let dayValue = item[dayKey];
        if (!dayValue) return;

        // Convert to weekday name if needed (for opening hours)
        if (useWeekdayName) {
            dayValue = new Date(dayValue)
                .toLocaleDateString('en-GB', { weekday: 'long' });
        }

        if (subKey && item[subKey] != null) {
            byDay[dayValue] = byDay[dayValue] || {};
            byDay[dayValue][item[subKey]] = item;
        } else {
            byDay[dayValue] = item;
        }
    });

    return byDay;
}

function generateTimeOptions(startHour, endHour, interval = 30, topLabel = null) {
    const options = [];

    if (topLabel) {
        options.push(`<option value="">${topLabel}</option>`); // empty value maps to null
    }

    for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += interval) {
            // Stop if hour + minutes exceed endHour
            if (h === endHour && m > 0) break;

            const hourStr = String(h).padStart(2, '0');
            const minStr = String(m).padStart(2, '0');
            options.push(`<option value="${hourStr}:${minStr}">${hourStr}:${minStr}</option>`);
        }
    }

    return options.join('');
}

function populateTimeSelect(table, options = {}) {
    if (!table) return;

    const tbodyRows = table.querySelectorAll('tbody tr');

    const interval = options.interval ?? 30;

    // Open Hours
    const openStart = options.openStartHour ?? 9;
    const openEnd = options.openEndHour ?? 12;
    const closeStart = options.closeStartHour ?? 12;
    const closeEnd = options.closeEndHour ?? 20;

    const openOptions = generateTimeOptions(openStart, openEnd, interval, 'Closed');
    const closeOptions = generateTimeOptions(closeStart, closeEnd, interval, 'Closed');

    // Shifts
    const startHour = options.startHour ?? 8;
    const endHour = options.endHour ?? 20;

    const shiftOptionsStart = generateTimeOptions(startHour, endHour, interval, 'None');
    const shiftOptionsEnd = generateTimeOptions(startHour, endHour, interval, 'None');

    tbodyRows.forEach(row => {
        // Populate Open Hours selects
        row.querySelectorAll('.open-select').forEach(sel => sel.innerHTML = openOptions);
        row.querySelectorAll('.close-select').forEach(sel => sel.innerHTML = closeOptions);

        // Populate Shifts selects
        row.querySelectorAll('.start-select').forEach(sel => sel.innerHTML = shiftOptionsStart);
        row.querySelectorAll('.end-select').forEach(sel => sel.innerHTML = shiftOptionsEnd);
    });
}

// Format ISO date for user display
function formatDisplayDate(isoDate) {
    if (!isoDate) return '-';
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`; // dd/mm/yyyy
}

// Parse user-facing dd/mm/yyyy back to ISO (for backend if needed)
function parseDisplayDateToISO(displayDate) {
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function timeToMinutes(time) {
    if (!time || time === 'None') return null;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function validateShiftOverlaps(shifts) {
    const errors = [];
    const shiftsByDate = {};

    // Group shifts by date
    shifts.forEach(shift => {
        if (!shiftsByDate[shift.date]) shiftsByDate[shift.date] = [];
        shiftsByDate[shift.date].push(shift);
    });

    Object.entries(shiftsByDate).forEach(([date, dailyShifts]) => {
        // Only consider shifts that have both start and end times
        const validShifts = dailyShifts.filter(s => s.start && s.end);

        // Sort by start time
        validShifts.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

        for (let i = 0; i < validShifts.length - 1; i++) {
            const current = validShifts[i];
            const next = validShifts[i + 1];

            const currentEnd = timeToMinutes(current.end);
            const nextStart = timeToMinutes(next.start);

            const overlap = currentEnd - nextStart;

            if (overlap < 30) {
                errors.push(
                    `Shift "${next.name}" on ${formatDisplayDate(date)} overlaps less than 30 minutes with "${current.name}". There must be a 30-60 minute overlap.`
                );
            } else if (overlap > 60) {
                errors.push(
                    `Shift "${next.name}" on ${formatDisplayDate(date)} overlaps more than 60 minutes with "${current.name}". There must be a 30-60 minute overlap.`
                );
            }
        }
    });

    return errors;
}