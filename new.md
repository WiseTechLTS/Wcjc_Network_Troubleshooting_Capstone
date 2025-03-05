```markdown
# Combined Infrastructure Deployment and Management

This document consolidates two distinct yet complementary implementations of a secure, resilient, and scalable IT infrastructure. The first portion details the Wcjc_Network_Troubleshooting_Capstone Project — a small business–oriented system based on Ubuntu. The second portion demonstrates how a similar architecture can be deployed on Fedora 41 with SELinux, Firewalld, and container orchestration tools. Together, they provide comprehensive guidance for designing, securing, and maintaining modern IT environments.

---

## Table of Contents

1. [Wcjc_Network_Troubleshooting_Capstone Project (Ubuntu)](#wcjc_network_troubleshooting_capstone-project-ubuntu)
   1. [Introduction & Scope](#introduction--scope)
   2. [Project Overview](#project-overview)
   3. [System Architecture & Security Measures](#system-architecture--security-measures)
   4. [Deployment & Implementation Process](#deployment--implementation-process)
   5. [Team Member Contributions](#team-member-contributions)
   6. [Maintenance & Troubleshooting](#maintenance--troubleshooting)
   7. [Future Scalability & Innovation](#future-scalability--innovation)
   8. [Conclusion](#conclusion)

2. [Fedora 41 Infrastructure Deployment and Management](#fedora-41-infrastructure-deployment-and-management)
   1. [Project Overview](#project-overview-1)
   2. [System Architecture & Security Measures](#system-architecture--security-measures-1)
   3. [Installation and Environment Setup](#installation-and-environment-setup)
   4. [Configuration and Maintenance](#configuration-and-maintenance)
   5. [Team Contributions](#team-contributions-1)
   6. [Future Scalability & Innovation](#future-scalability--innovation-1)
   7. [Conclusion](#conclusion-1)
   8. [Contact](#contact)

---

# Wcjc_Network_Troubleshooting_Capstone Project (Ubuntu)

## Introduction & Scope

The Wcjc_Network_Troubleshooting_Capstone Project is a comprehensive, hands-on initiative in the Information Technology Network and Computer Systems Administrator AAS program. Its goal is to architect, deploy, secure, and validate a scalable IT infrastructure tailored to a small business environment—specifically Art Cellar Houston. This project covers the entire lifecycle of deployment, from operating system installation to thorough network hardening, secure data management, and automated backup procedures.

Key technologies include:  
- Ubuntu Desktop for the primary business system  
- Ubuntu Server for firewall and backup server roles  
- SQLite for a lightweight yet secure database solution  
- iptables, UFW, rsync, cron, Bash scripting, and Google Authenticator to ensure security and automation

The following sections provide a detailed guide to implementing this Ubuntu-based infrastructure.

---

## Project Overview

This Ubuntu-based capstone showcases our expertise in deploying a secure, high-performance network infrastructure for small organizations. The key objectives are:

1. Operational Excellence:  
   Provide a centralized Ubuntu Desktop platform integrated with a dedicated firewall and backup server, ensuring continuous business operations.

2. Security & Compliance:  
   Enforce a zero-trust security model that includes rigorous authentication, network segmentation, continuous monitoring, and multi-factor authentication.

3. Scalability & Resilience:  
   Architect an adaptable system that evolves with business needs while preserving data integrity.

---

## System Architecture & Security Measures

### Core Components

1. Primary System (Ubuntu Desktop):  
   - Role: Core workstation for business-critical tasks, local database handling, and web/application hosting.  
   - Software Stack: Ubuntu Desktop, SQLite, monitoring utilities, and productivity tools.

2. Firewall & Backup Server (Ubuntu Server @ 192.168.1.101):  
   - Role: Provides robust network security, firewall services, and handles automated backups for critical data.  
   - Software Stack: Ubuntu Server, iptables, UFW, SSH, rsync, cron.

3. Internal Database (SQLite):  
   - Location: `/var/lib/sqlite/database.db`  
   - Security Measures: File permissions, encryption, and integrity checks.

### Security Paradigms

- Zero-Trust Architecture: Every connection and request is continually authenticated and verified.  
- Role-Based Access Control (RBAC): Restricts privileges to limit vulnerability exposure.  
- Intrusion Detection & Prevention: Monitored in real time via IDS tools or syslog analysis to rapidly address suspicious activities.  
- Data Encryption: Confidential data is protected both at rest and in transit.  
- Patch Management: Continuous updates and security patches to mitigate newly discovered threats.

---

## Deployment & Implementation Process

### Phase 1: Ubuntu Desktop Setup

1. System Update & Package Installation:
   ```sh
   sudo apt update && sudo apt upgrade -y
   sudo apt install sqlite3 rsync ufw iptables vim -y
   ```
2. User Account & Access Control:
   ```sh
   sudo adduser artcellar_admin
   sudo usermod -aG sudo artcellar_admin
   ```
3. Multi-Factor Authentication Setup:
   ```sh
   sudo apt install libpam-google-authenticator -y
   google-authenticator
   ```
   *(Follow interactive prompts.)*

---

### Phase 2: Firewall & Networking Setup (Ubuntu Server)

1. Install and Configure UFW & iptables:
   ```sh
   sudo apt update && sudo apt upgrade -y
   sudo apt install ufw iptables -y
   ```
2. Set Baseline Security Policies:
   ```sh
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```
3. Advanced iptables Rules:
   ```sh
   sudo iptables -A INPUT -i lo -j ACCEPT
   sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
   sudo iptables -A INPUT -m conntrack --ctstate INVALID -j DROP
   sudo iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "IPTables-Dropped: "
   sudo sh -c "iptables-save > /etc/iptables/rules.v4"
   ```
4. Enable UFW & Verify:
   ```sh
   sudo ufw enable
   sudo ufw status verbose
   ```

---

### Phase 3: SQLite Database Deployment

1. Initialization:
   ```sh
   sudo mkdir -p /var/lib/sqlite
   sudo sqlite3 /var/lib/sqlite/database.db "VACUUM;"
   ```
2. Secure File Permissions:
   ```sh
   sudo chown artcellar_admin:artcellar_admin /var/lib/sqlite/database.db
   sudo chmod 600 /var/lib/sqlite/database.db
   ```

---

### Phase 4: SSH-Based Backup Automation

1. SSH Key Generation & Transfer:
   ```sh
   ssh-keygen -t rsa -b 4096 -C "backup@artcellar"
   ssh-copy-id -i ~/.ssh/id_rsa.pub artcellar_admin@192.168.1.101
   ```
2. Bash Backup Script (/opt/scripts/backup.sh):
   ```bash
   #!/bin/bash
   # Backup SQLite database using rsync over SSH

   SOURCE="/var/lib/sqlite/database.db"
   DESTINATION="artcellar_admin@192.168.1.101:/var/backups/sqlite/$(date +'%Y-%m-%d')/"

   ssh artcellar_admin@192.168.1.101 "mkdir -p /var/backups/sqlite/$(date +'%Y-%m-%d')"
   rsync -avz -e ssh $SOURCE $DESTINATION

   echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup completed." >> /var/log/backup.log
   ```
   ```sh
   sudo mkdir -p /opt/scripts
   sudo vim /opt/scripts/backup.sh
   sudo chmod +x /opt/scripts/backup.sh
   ```
3. Automated Cron Jobs:
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

---

## Team Member Contributions

1. Kyle Wisecarver (Architecture & Documentation):  
   Designs the overall network framework, enforces security best practices (zero-trust, RBAC), and maintains thorough documentation.
2. Ethan (Firewall & Networking):  
   Configures UFW/iptables, sets firewall rules, and ensures stable connectivity among Ubuntu systems.
3. Jose (Assistance & End-User Testing):  
   Provides administrative support, tests both local and remote user scenarios, and troubleshoots potential network or configuration problems.

---

## Maintenance & Troubleshooting

- System Updates:  
  ```sh
  sudo apt update && sudo apt upgrade -y
  ```
- Log Monitoring:  
  ```sh
  sudo tail -f /var/log/syslog
  sudo tail -f /var/log/backup.log
  ```
- Firewall & Network Diagnostics:  
  ```sh
  sudo iptables -L -v
  sudo ufw status verbose
  ```
- SSH Connectivity:  
  ```sh
  ssh artcellar_admin@192.168.1.101 "echo 'SSH connection successful'"
  ```

Troubleshooting Scenarios:  
- Backup Failures: Check SSH connectivity and rsync logs.  
- Firewall Anomalies: Examine iptables/UFW configs and system logs.  
- Network Performance Issues: Use syslog and diagnostic tools to isolate latency or congestion.

---

## Future Scalability & Innovation

- Cloud Integration: Employ hybrid cloud or multi-cloud solutions for data redundancy and availability.  
- Containerization & Orchestration: Investigate Docker or Kubernetes to manage scalable, containerized services.  
- Automation & AI: Integrate AI-driven monitoring for predictive maintenance and proactive alerts.  
- Continuous Improvement: Host innovation workshops to incorporate emerging security techniques and system enhancements.

---

## Conclusion

The Wcjc_Network_Troubleshooting_Capstone Project exemplifies advanced skills in deploying, securing, and managing a small business–focused IT environment using Ubuntu. By embracing a zero-trust approach, robust firewall policies, multi-factor authentication, and automated backups, the system ensures high reliability and stringent security. Clear role assignments—Kyle for architecture/documentation, Ethan for firewall/networking, and Jose for admin/testing—enable a cohesive, future-proof solution that safeguards Art Cellar Houston’s operations.

---

# Fedora 41 Infrastructure Deployment and Management

Submitted by: Kyle Wisecarver

---

## Project Overview

This second implementation uses Fedora 41 to establish a similarly secure, scalable infrastructure. While the Ubuntu solution focuses on iptables, UFW, and Google Authenticator, Fedora 41 leverages:

- DNF Package Manager for system updates and software management  
- SELinux & Firewalld for granular security controls  
- Podman, Buildah, Kubernetes for container orchestration  
- Wireguard VPN for secure remote access

These features deliver a forward-looking platform aligned with zero-trust principles and cloud-native deployments.

---

## System Architecture & Security Measures

### Core Components

- Primary System (Fedora 41 Workstation):  
  - Role: Provides a robust desktop environment suitable for business tasks, local development, and productivity.  

- Server (Fedora 41 Server):  
  - Role: Hosts mission-critical services (e.g., Apache for web hosting, MariaDB for databases) with hardened security.

- Minimal Core Installation:  
  - Role: An optimized Fedora system for container-based workloads and cloud orchestration, complete with Wireguard for secure networking.

### Security Paradigms

- SELinux & Firewalld: Enforced by default, requiring explicit configuration for network rules.  
- Zero-Trust Architecture & RBAC: Continuous authentication for each connection, plus tight role-based privileges.  
- Data Encryption & Patch Management: Ensures data safety at rest and in transit, with prompt security updates.

---

## Installation and Environment Setup

### Workstation Installation

1. Create Bootable Media & Verify ISO:
   ```bash
   sha256sum Fedora-Workstation-Live-x86_64-41-1.0.iso
   ```
2. Install Fedora Workstation:
   - Boot from USB and follow the Anaconda installer prompts.
   - Update the system:
     ```bash
     sudo dnf update --refresh -y
     ```

### Server and Core Installation

1. Fedora Server or Minimal Installation:
   ```bash
   sudo dnf update --refresh -y
   ```
2. Install Essential Services:
   ```bash
   sudo dnf install httpd mariadb-server -y
   sudo systemctl enable --now httpd
   sudo systemctl enable --now mariadb
   ```

---

## Configuration and Maintenance

### Security Hardening

1. SELinux & Firewalld:
   ```bash
   sudo getenforce
   sudo systemctl enable --now firewalld
   ```
2. Utility Tools:
   ```bash
   sudo dnf install vim git wget curl net-tools -y
   ```

### Core Customization for Containerization

1. Container Tools (Podman, Buildah, Kubernetes):
   ```bash
   sudo dnf install podman buildah kubernetes -y
   ```
2. Configure Wireguard VPN:
   ```bash
   wg genkey | tee privatekey | wg pubkey > publickey
   # Create /etc/wireguard/wg0.conf accordingly
   sudo systemctl enable --now wg-quick@wg0
   ```

### Dependency Management and Routine Maintenance

1. Python Virtual Environment (example):
   ```bash
   python3 -m venv ~/myenv
   source ~/myenv/bin/activate
   pip install -r requirements.txt
   ```
2. Automate Updates via Cron:
   ```bash
   sudo crontab -e
   # 0 2 * * * /usr/bin/dnf update --refresh -y
   ```
3. Monitoring & Logging:
   ```bash
   sudo journalctl -xe
   ```

---

## Team Contributions

- Kyle Wisecarver (Project Lead): Oversees architecture, SELinux/firewall configuration, container deployment, and documentation.  
- Ethan: Configures Firewalld policies and networking, ensuring robust segmentation and controlled service exposure.  
- Jose: Offers system administration assistance, conducts end-to-end testing, and resolves any performance or security anomalies.

---

## Future Scalability & Innovation

1. Cloud Migration: Integrate Fedora Server with private/hybrid/multi-cloud services for redundancy and elasticity.  
2. AI-Driven Monitoring: Adopt predictive analytics for resource scaling and incident prevention.  
3. Continuous Improvement: Regularly evaluate emerging security tools and container orchestration advancements.

---

## Conclusion

By leveraging Fedora 41’s default security posture (SELinux, Firewalld) and container ecosystem (Podman, Buildah, Kubernetes), organizations can build future-proof, high-performance infrastructures. This approach complements the Ubuntu-based capstone project, demonstrating a flexible path for small businesses and IT teams looking to expand via additional security layers and advanced containerization.

---

## Contact

For additional information or inquiries on either solution, please contact:

Kyle Wisecarver
```
