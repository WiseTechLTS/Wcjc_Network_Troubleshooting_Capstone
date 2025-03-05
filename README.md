**Project Title: Combined Infrastructure Deployment and Management**  
**Submitted by: Kyle Wisecarver**


## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction \& Scope](#introduction--scope)
- [Project Overview](#project-overview)
  - [Strategic Goals](#strategic-goals)
  - [Core Components (Shared Concept)](#core-components-shared-concept)
- [System Architecture \& Security Measures](#system-architecture--security-measures)
- [Ubuntu‐Based Deployment](#ubuntubased-deployment)
  - [Deployment \& Implementation Process](#deployment--implementation-process)
  - [Team Member Contributions](#team-member-contributions)
  - [Maintenance \& Troubleshooting](#maintenance--troubleshooting)
- [Fedora 41 Deployment](#fedora41-deployment)
  - [Installation and Environment Setup](#installation-and-environment-setup)
  - [Configuration and Maintenance](#configuration-and-maintenance)
- [Future Scalability \& Innovation](#future-scalability--innovation)
- [Conclusion](#conclusion)


## Introduction & Scope

This document provides an end-to-end technical blueprint for deploying a robust, secure, and scalable IT infrastructure using both **Ubuntu** (Desktop and Server) and **Fedora 41** (Workstation, Server, and Core). While the foundational objectives—operational excellence, strong security, and future adaptability—remain the same, each platform leverages its native tools for package management, firewall configuration, and container orchestration. This combined approach is especially helpful for small to medium enterprises seeking flexibility in choosing either Ubuntu or Fedora as their primary environment.


## Project Overview

### Strategic Goals

1. **Operational Excellence:**  
   - Ensure uninterrupted business operations via dedicated workstation/server setups, automated backups, and streamlined user management.

2. **Security & Compliance:**  
   - Adopt a zero-trust model, featuring multi-factor authentication, strong firewall rules, and continuous monitoring.  
   - Enforce role-based access control (RBAC) and data encryption measures to protect sensitive information.

3. **Scalability & Resilience:**  
   - Design flexible architectures capable of integrating with container orchestration systems and hybrid-cloud solutions.  
   - Implement best practices for quick recovery and minimal downtime.

### Core Components (Shared Concept)

- **Primary System (Desktop/Workstation):** Acts as the main interface for user activities, local development, and certain on-premises services.  
- **Server Environment:** Ensures firewall protection, hosts mission-critical services (e.g., web server, database), and provides automated backup routines.  
- **Database Layer:** Typically a lightweight database engine (SQLite) to facilitate local or small-scale data transactions.  
- **Firewall & VPN Tools:** iptables/UFW on Ubuntu or Firewalld on Fedora for strict network segmentation, with Wireguard for secure remote access if desired.  
- **Automation & Scripting:** Tools like cron, Bash scripts, and rsync for backup processes, updates, and system health checks.


## System Architecture & Security Measures

**Zero-Trust & RBAC:** Both Ubuntu and Fedora 41 deployments emphasize a zero-trust approach with robust authentication flows. Users receive privileges strictly according to their role, minimizing attack vectors.

**Intrusion Detection & Prevention:** Real-time monitoring via system logs (syslog, journalctl) and frequent log reviews helps detect anomalies. Best‐practice intrusion detection systems (IDS) may be integrated as needed.

**Patch & Package Management:**  
- **Ubuntu:** Uses apt/apt-get.  
- **Fedora:** Uses dnf, with SELinux and Firewalld enabled by default.  

**Data Encryption & MFA:**  
- Google Authenticator on Ubuntu for multi-factor.  
- SELinux’s mandatory access control on Fedora, combined with secure VPN (Wireguard) if needed for remote administration.


## Ubuntu‐Based Deployment

This portion details how to build and maintain a scalable, secure environment using Ubuntu Desktop (for the primary workstation) and Ubuntu Server (for firewall and backup services). A typical scenario includes a small business setup—such as Art Cellar Houston—leveraging a zero-trust security model and robust network segmentation.

### Deployment & Implementation Process

1. **Ubuntu Desktop Setup**  
   - **Update & Install Packages:**
     ```sh
     sudo apt update && sudo apt upgrade -y
     sudo apt install sqlite3 rsync ufw iptables vim -y
     ```
   - **User Creation & Access Control:**
     ```sh
     sudo adduser artcellar_admin
     sudo usermod -aG sudo artcellar_admin
     ```
   - **Multi-Factor Authentication:**
     ```sh
     sudo apt install libpam-google-authenticator -y
     google-authenticator
     ```
     *(Follow on-screen prompts.)*

2. **Firewall & Networking Setup (Ubuntu Server @ 192.168.1.101)**  
   - **Install UFW & iptables:**
     ```sh
     sudo apt update && sudo apt upgrade -y
     sudo apt install ufw iptables -y
     ```
   - **Set Default Firewall Policies:**
     ```sh
     sudo ufw default deny incoming
     sudo ufw default allow outgoing
     sudo ufw allow ssh
     sudo ufw allow 80/tcp
     sudo ufw allow 443/tcp
     ```
   - **Advanced iptables:**
     ```sh
     sudo iptables -A INPUT -i lo -j ACCEPT
     sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
     sudo iptables -A INPUT -m conntrack --ctstate INVALID -j DROP
     sudo iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "IPTables-Dropped: "
     sudo sh -c "iptables-save > /etc/iptables/rules.v4"
     ```
   - **Enable UFW:**
     ```sh
     sudo ufw enable
     sudo ufw status verbose
     ```

3. **SQLite Database Deployment**  
   - **Initialization & Permissions:**
     ```sh
     sudo mkdir -p /var/lib/sqlite
     sudo sqlite3 /var/lib/sqlite/database.db "VACUUM;"
     sudo chown artcellar_admin:artcellar_admin /var/lib/sqlite/database.db
     sudo chmod 600 /var/lib/sqlite/database.db
     ```

4. **SSH‐Based Backup Automation**  
   - **Generate SSH Keys & Transfer:**
     ```sh
     ssh-keygen -t rsa -b 4096 -C "backup@artcellar"
     ssh-copy-id -i ~/.ssh/id_rsa.pub artcellar_admin@192.168.1.101
     ```
   - **Backup Script:**
     ```sh
     sudo mkdir -p /opt/scripts
     sudo vim /opt/scripts/backup.sh
     sudo chmod +x /opt/scripts/backup.sh
     ```
     **backup.sh:**
     ```bash
     #!/bin/bash
     SOURCE="/var/lib/sqlite/database.db"
     DESTINATION="artcellar_admin@192.168.1.101:/var/backups/sqlite/$(date +'%Y-%m-%d')/"

     ssh artcellar_admin@192.168.1.101 "mkdir -p /var/backups/sqlite/$(date +'%Y-%m-%d')"
     rsync -avz -e ssh $SOURCE $DESTINATION
     echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup completed." >> /var/log/backup.log
     ```
   - **Cron Jobs:**
     ```sh
     sudo crontab -e
     ```
     Add:
     ```
     # Weekly backup every Sunday at 3:00 AM
     0 3 * * 7 /opt/scripts/backup.sh
     # Monthly backup on the 1st at 3:00 AM
     0 3 1 * * /opt/scripts/backup.sh
     ```

### Team Member Contributions

- **Kyle Wisecarver (Architecture & Documentation):**  
  Designs overall network framework, enforces zero-trust/RBAC policies, and manages documentation.

- **Ethan (Firewall & Networking Setup):**  
  Configures UFW/iptables, ensures stable connectivity and robust firewall rules.

- **Jose (Assistance & End-User Testing):**  
  Performs system administration tasks, tests local/remote configurations, and troubleshoots issues.

### Maintenance & Troubleshooting

1. **System Updates:**
   ```sh
   sudo apt update && sudo apt upgrade -y
   ```
2. **Log Monitoring:**
   ```sh
   sudo tail -f /var/log/syslog
   sudo tail -f /var/log/backup.log
   ```
3. **Firewall & Network Diagnostics:**
   ```sh
   sudo iptables -L -v
   sudo ufw status verbose
   ```
4. **SSH Connectivity Test:**
   ```sh
   ssh artcellar_admin@192.168.1.101 "echo 'SSH connection successful'"
   ```


## Fedora 41 Deployment

Fedora 41 offers a parallel solution with built‐in SELinux, Firewalld, and container tools (Podman, Buildah, Kubernetes). These align well with a cloud‐native or container‐centric approach.

### Installation and Environment Setup

1. **Workstation Installation**  
   - **Create Bootable Media & Verify ISO:**
     ```bash
     sha256sum Fedora-Workstation-Live-x86_64-41-1.0.iso
     ```
   - **Install & Update System:**
     ```bash
     sudo dnf update --refresh -y
     ```

2. **Server and Core Installation**  
   - **Fedora Server or Minimal Image:**
     ```bash
     sudo dnf update --refresh -y
     ```
   - **Essential Services (e.g., Web & DB):**
     ```bash
     sudo dnf install httpd mariadb-server -y
     sudo systemctl enable --now httpd
     sudo systemctl enable --now mariadb
     ```

### Configuration and Maintenance

1. **Security Hardening**  
   - **Check SELinux & Firewalld:**
     ```bash
     sudo getenforce
     sudo systemctl enable --now firewalld
     ```
   - **Install Utilities:**
     ```bash
     sudo dnf install vim git wget curl net-tools -y
     ```

2. **Core Customization for Containerization**  
   - **Podman, Buildah, Kubernetes:**
     ```bash
     sudo dnf install podman buildah kubernetes -y
     ```
   - **Wireguard VPN Setup (Optional):**
     ```bash
     wg genkey | tee privatekey | wg pubkey > publickey
     # Create /etc/wireguard/wg0.conf with peer config
     sudo systemctl enable --now wg-quick@wg0
     ```

3. **Dependency Management & Routine Maintenance**  
   - **Python Example:**
     ```bash
     python3 -m venv ~/myenv
     source ~/myenv/bin/activate
     pip install -r requirements.txt
     ```
   - **Automated Updates:**
     ```bash
     sudo crontab -e
     # 0 2 * * * /usr/bin/dnf update --refresh -y
     ```
   - **Monitoring & Logging:**
     ```bash
     sudo journalctl -xe
     ```


## Future Scalability & Innovation

Both the Ubuntu and Fedora architectures can be extended in the following ways:

1. **Cloud Integration:** Migrate or connect on‐premises systems to AWS, Azure, or hybrid‐cloud solutions.  
2. **Container Orchestration:** Deploy Docker or fully utilize Kubernetes for large‐scale container management.  
3. **AI‐Driven Monitoring:** Implement predictive analytics, anomaly detection, or self‐healing infrastructures.  
4. **Continuous Improvement:** Incorporate new security measures (e.g., IDS/IPS systems), adopt advanced logging frameworks, and enhance user experience through iterative feedback.


## Conclusion

This combined guide illustrates two parallel approaches—Ubuntu‐based and Fedora‐based—for creating a secure, reliable, and future‐ready infrastructure. Both solutions emphasize:
- **Zero‐trust security** (multi-factor auth, robust firewall rules, and data encryption).
- **Regular updates and patching** to mitigate security vulnerabilities.
- **Automation** (cron jobs, Bash scripts, container orchestration) for routine tasks.

By documenting these procedures, administrators can choose the platform that best aligns with their operational needs and skill sets while ensuring a high level of network integrity, fault tolerance, and scale potential.

