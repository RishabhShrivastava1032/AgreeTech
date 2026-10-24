document.addEventListener("DOMContentLoaded", () => {
    // 1. Sidebar Menu Active State Switching
    const menuItems = document.querySelectorAll(".sidebar .menu li");
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

    // 2. Equipment Approval Actions (Approve)
    const approveButtons = document.querySelectorAll(".button-approve");
    approveButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const row = e.target.closest("tr");
            const statusBadge = row ? row.querySelector(".status-badge") : null;
            
            if (statusBadge) {
                statusBadge.textContent = "Approved";
                statusBadge.className = "status-badge approved";
            }
            alert("Equipment has been approved successfully!");
        });
    });

    // 3. Equipment Rejection Actions (Reject)
    const rejectButtons = document.querySelectorAll(".button-reject");
    rejectButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const row = e.target.closest("tr");
            const statusBadge = row ? row.querySelector(".status-badge") : null;
            
            if (statusBadge) {
                statusBadge.textContent = "Rejected";
                statusBadge.className = "status-badge rejected";
            }
            alert("Equipment application has been rejected.");
        });
    });

    // 4. Logout Button Action
    const logoutBtn = document.querySelector(".logout-button");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out as Admin?")) {
                alert("Logged out successfully.");
                window.location.href = "login.html"; // Redirects back to login page
            }
        });
    }
});