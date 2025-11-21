// Data Storage
let patients = JSON.parse(localStorage.getItem('patients')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];

// Navigation
function showSection(sectionId) {
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });
    
    // Refresh data when showing sections
    if(sectionId === 'appointments') {
        displayAppointments();
    } else if(sectionId === 'patients') {
        displayPatients();
    } else if(sectionId === 'admin') {
        updateAdminDashboard();
    } else if(sectionId === 'home') {
        updateStats();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
    
    // Appointment Form
    document.getElementById('appointmentForm').addEventListener('submit', handleAppointmentSubmit);
    
    // Patient Form
    document.getElementById('patientForm').addEventListener('submit', handlePatientSubmit);
    
    // Search
    document.getElementById('searchPatient').addEventListener('input', handleSearch);
    
    // Initialize
    updateStats();
    displayAppointments();
    displayPatients();
});

// Appointment Functions
function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const appointment = {
        id: 'APT' + Date.now(),
        name: document.getElementById('appointmentName').value,
        phone: document.getElementById('appointmentPhone').value,
        email: document.getElementById('appointmentEmail').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        doctor: document.getElementById('appointmentDoctor').value,
        reason: document.getElementById('appointmentReason').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Add activity
    addActivity(`New appointment booked for ${appointment.name}`);
    
    // Reset form
    e.target.reset();
    
    // Show success message
    alert('Appointment booked successfully!');
    
    // Update display
    displayAppointments();
    updateStats();
}

function displayAppointments() {
    const container = document.getElementById('appointmentsList');
    
    if(appointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No appointments scheduled yet.</div>';
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(apt => apt.date === today);
    
    if(todaysAppointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No appointments for today.</div>';
        return;
    }
    
    container.innerHTML = todaysAppointments.map(apt => `
        <div class="card">
            <h3>${apt.name} <span class="status-badge status-${apt.status}">${apt.status}</span></h3>
            <p><strong>ID:</strong> ${apt.id}</p>
            <p><strong>Phone:</strong> ${apt.phone}</p>
            <p><strong>Doctor:</strong> ${apt.doctor}</p>
            <p><strong>Time:</strong> ${apt.time}</p>
            <p><strong>Reason:</strong> ${apt.reason}</p>
            <div class="card-actions">
                <button class="btn-success" onclick="updateAppointmentStatus('${apt.id}', 'completed')">Complete</button>
                <button class="btn-danger" onclick="updateAppointmentStatus('${apt.id}', 'cancelled')">Cancel</button>
            </div>
        </div>
    `).join('');
}

function updateAppointmentStatus(id, status) {
    const appointment = appointments.find(apt => apt.id === id);
    if(appointment) {
        appointment.status = status;
        localStorage.setItem('appointments', JSON.stringify(appointments));
        addActivity(`Appointment ${id} marked as ${status}`);
        displayAppointments();
        updateStats();
        updateAdminDashboard();
    }
}

// Patient Functions
function handlePatientSubmit(e) {
    e.preventDefault();
    
    const patient = {
        id: 'PAT' + Date.now(),
        name: document.getElementById('patientName').value,
        age: document.getElementById('patientAge').value,
        gender: document.getElementById('patientGender').value,
        phone: document.getElementById('patientPhone').value,
        email: document.getElementById('patientEmail').value,
        bloodGroup: document.getElementById('patientBlood').value,
        address: document.getElementById('patientAddress').value,
        medicalHistory: document.getElementById('patientMedical').value,
        registeredAt: new Date().toISOString()
    };
    
    patients.push(patient);
    localStorage.setItem('patients', JSON.stringify(patients));
    
    // Add activity
    addActivity(`New patient registered: ${patient.name}`);
    
    // Reset form
    e.target.reset();
    
    // Show success message
    alert('Patient registered successfully!');
    
    // Update display
    displayPatients();
    updateStats();
}

function displayPatients(filteredPatients = null) {
    const container = document.getElementById('patientsList');
    const patientsToDisplay = filteredPatients || patients;
    
    if(patientsToDisplay.length === 0) {
        container.innerHTML = '<div class="empty-state">No patients registered yet.</div>';
        return;
    }
    
    container.innerHTML = patientsToDisplay.map(patient => `
        <div class="card">
            <h3>${patient.name}</h3>
            <p><strong>ID:</strong> ${patient.id}</p>
            <p><strong>Age:</strong> ${patient.age} | <strong>Gender:</strong> ${patient.gender}</p>
            <p><strong>Blood Group:</strong> ${patient.bloodGroup}</p>
            <p><strong>Phone:</strong> ${patient.phone}</p>
            <p><strong>Email:</strong> ${patient.email || 'N/A'}</p>
            <p><strong>Address:</strong> ${patient.address}</p>
            ${patient.medicalHistory ? `<p><strong>Medical History:</strong> ${patient.medicalHistory}</p>` : ''}
            <div class="card-actions">
                <button class="btn-info" onclick="viewPatient('${patient.id}')">View Details</button>
                <button class="btn-danger" onclick="deletePatient('${patient.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if(searchTerm === '') {
        displayPatients();
        return;
    }
    
    const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.phone.includes(searchTerm) ||
        patient.id.toLowerCase().includes(searchTerm)
    );
    
    displayPatients(filtered);
}

function viewPatient(id) {
    const patient = patients.find(p => p.id === id);
    if(patient) {
        alert(`Patient Details:\n\nName: ${patient.name}\nID: ${patient.id}\nAge: ${patient.age}\nGender: ${patient.gender}\nBlood Group: ${patient.bloodGroup}\nPhone: ${patient.phone}\nEmail: ${patient.email || 'N/A'}\nAddress: ${patient.address}\nMedical History: ${patient.medicalHistory || 'None'}`);
    }
}

function deletePatient(id) {
    if(confirm('Are you sure you want to delete this patient record?')) {
        patients = patients.filter(p => p.id !== id);
        localStorage.setItem('patients', JSON.stringify(patients));
        addActivity(`Patient record deleted: ${id}`);
        displayPatients();
        updateStats();
    }
}

// Stats Functions
function updateStats() {
    document.getElementById('totalPatients').textContent = patients.length;
    document.getElementById('totalRecords').textContent = patients.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(apt => apt.date === today);
    document.getElementById('totalAppointments').textContent = todaysAppointments.length;
}

// Admin Functions
function updateAdminDashboard() {
    document.getElementById('adminTotalPatients').textContent = patients.length;
    document.getElementById('adminTotalAppointments').textContent = appointments.length;
    
    const pending = appointments.filter(apt => apt.status === 'pending').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    
    document.getElementById('adminPendingAppointments').textContent = pending;
    document.getElementById('adminCompletedAppointments').textContent = completed;
    
    // Display recent activities
    displayRecentActivity();
}

function displayRecentActivity() {
    const container = document.getElementById('recentActivity');
    
    if(activities.length === 0) {
        container.innerHTML = '<div class="empty-state">No recent activity.</div>';
        return;
    }
    
    const recentActivities = activities.slice(-10).reverse();
    container.innerHTML = recentActivities.map(activity => `
        <div class="card">
            <p>${activity.message}</p>
            <small>${new Date(activity.timestamp).toLocaleString()}</small>
        </div>
    `).join('');
}

function addActivity(message) {
    activities.push({
        message,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('activities', JSON.stringify(activities));
}

function exportData() {
    const data = {
        patients,
        appointments,
        activities,
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hospital-data-${Date.now()}.json`;
    link.click();
    
    addActivity('Data exported');
    alert('Data exported successfully!');
}

function clearAllData() {
    if(confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
        if(confirm('This will delete all patients, appointments, and activities. Continue?')) {
            localStorage.clear();
            patients = [];
            appointments = [];
            activities = [];
            
            alert('All data has been cleared!');
            location.reload();
        }
    }
}
