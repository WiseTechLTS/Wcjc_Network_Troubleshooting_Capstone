# Wcjc_Network_Troubleshooting_Capstone Project

## Introduction & Scope

This capstone project is a comprehensive, hands-on initiative within the Information Technology Network and Computer Systems Administrator AAS program. Our objective is to architect, deploy, secure, and validate a scalable IT infrastructure tailored for a small business environment at Art Cellar Houston. The project’s scope encompasses every facet of system deployment—from operating system installation to rigorous network hardening, secure data management, and automated backup procedures. We will leverage a suite of industry-standard software, including **Ubuntu Desktop** (for the primary business system), **Ubuntu Server** (serving both as the firewall and backup node), and **SQLite** (for lightweight yet secure database management). Essential security tools such as **iptables**, **UFW**, **rsync**, **cron**, and **Bash scripting** are integral to our strategy, while multi-factor authentication is enforced using **Google Authenticator**. This document provides an exhaustive blueprint, including detailed command-line instructions, role-specific team contributions, and future scalability recommendations, ensuring that our IT solution is both robust and future-proof.

---

## Project Overview

This project exemplifies our proficiency in deploying a secure and efficient network infrastructure for small business environments. The strategic goals include:

- **Operational Excellence:** Ensure uninterrupted business operations with a centralized Ubuntu Desktop system integrated with a dedicated firewall and backup server.
- **Security & Compliance:** Implement a zero-trust security model that features rigorous authentication, network segmentation, and continuous monitoring.
- **Scalability & Resilience:** Build an adaptable architecture that evolves with business demands while safeguarding data integrity.

---

## System Architecture & Security Measures

### Core Components

- **Primary System (Ubuntu Desktop):**  
  - **Role:** Acts as the central node for business-critical operations, internal database management, and web application hosting.  
  - **Software Stack:** Ubuntu Desktop, SQLite, and essential business and monitoring applications.

- **Firewall & Backup Server (Ubuntu Server @ 192.168.1.101):**  
  - **Role:** Provides robust network security through firewall services and secures data backups.  
  - **Software Stack:** Ubuntu Server, iptables, UFW, SSH, and automated backup tools.

- **Internal Database (SQLite):**  
  - **Location:** `/var/lib/sqlite/database.db`  
  - **Security Measures:** Enforced file permissions, encryption protocols, and regular integrity checks to ensure that sensitive business data remains secure.

### Security Paradigms

- **Zero-Trust Architecture:** Each connection is continuously authenticated and verified.
- **Role-Based Access Control (RBAC):** Strict access permissions are enforced to minimize potential vulnerabilities.
- **Intrusion Detection & Prevention:** Real-time monitoring using IDS tools ensures prompt detection and mitigation of suspicious activities.
- **Data Encryption:** Robust encryption practices protect data both at rest and during transmission.
- **Patch Management:** Regular system updates and security patches are applied to safeguard against emerging threats.

---

## Deployment & Implementation Process

### Phase 1: Ubuntu Desktop Setup

#### System Update & Package Installation
Update your system and install essential software packages:
```sh
sudo apt update && sudo apt upgrade -y
sudo apt install sqlite3 rsync ufw iptables vim -y
```

#### User Account & Access Control
Create a dedicated business user with appropriate sudo privileges:
```sh
sudo adduser artcellar_admin
sudo usermod -aG sudo artcellar_admin
```

#### Multi-Factor Authentication Setup
Enhance security with MFA using Google Authenticator:
```sh
sudo apt install libpam-google-authenticator -y
google-authenticator
```
*(Follow the interactive prompts to complete the MFA setup.)*

---

### Phase 2: Firewall & Networking Setup (Ubuntu Server)

#### Install and Configure UFW & iptables
On the Ubuntu Server (IP: 192.168.1.101), execute the following:
```sh
sudo apt update && sudo apt upgrade -y
sudo apt install ufw iptables -y
```

#### Set Default Policies and Enable Essential Services
Establish baseline security policies:
```sh
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

#### Implement Advanced iptables Rules
Further harden network security:
```sh
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A INPUT -m conntrack --ctstate INVALID -j DROP
sudo iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "IPTables-Dropped: "
```
_Save the iptables configuration:_
```sh
sudo sh -c "iptables-save > /etc/iptables/rules.v4"
```

#### Enable UFW
Activate UFW and verify its status:
```sh
sudo ufw enable
sudo ufw status verbose
```

---

### Phase 3: SQLite Database Deployment

#### Database Initialization
Establish the database directory and initialize SQLite:
```sh
sudo mkdir -p /var/lib/sqlite
sudo sqlite3 /var/lib/sqlite/database.db "VACUUM;"
```

#### Secure File Permissions
Set strict ownership and permission parameters:
```sh
sudo chown artcellar_admin:artcellar_admin /var/lib/sqlite/database.db
sudo chmod 600 /var/lib/sqlite/database.db
```

---

### Phase 4: SSH-Based Backup Automation

#### SSH Key Generation & Transfer
Generate an SSH key and transfer it to the backup server:
```sh
ssh-keygen -t rsa -b 4096 -C "backup@artcellar"
ssh-copy-id -i ~/.ssh/id_rsa.pub artcellar_admin@192.168.1.101
```

#### Bash Backup Script Creation
Create the backup script at `/opt/scripts/backup.sh`:
```sh
sudo mkdir -p /opt/scripts
sudo vim /opt/scripts/backup.sh
```
_Paste the following script:_
```bash
#!/bin/bash
# Backup SQLite database using rsync over SSH

SOURCE="/var/lib/sqlite/database.db"
DESTINATION="artcellar_admin@192.168.1.101:/var/backups/sqlite/$(date +'%Y-%m-%d')/"

# Create destination directory on remote server
ssh artcellar_admin@192.168.1.101 "mkdir -p /var/backups/sqlite/$(date +'%Y-%m-%d')"

# Rsync the database file securely
rsync -avz -e ssh $SOURCE $DESTINATION

# Log the backup process
echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup completed." >> /var/log/backup.log
```
_Make the script executable:_
```sh
sudo chmod +x /opt/scripts/backup.sh
```

#### Schedule Automated Cron Jobs
Configure cron jobs to ensure regular backups:
```sh
sudo crontab -e
```
_Add these lines:_
```
# Weekly backup every Sunday at 3:00 AM
0 3 * * 7 /opt/scripts/backup.sh

# Monthly backup on the 1st at 3:00 AM
0 3 1 * * /opt/scripts/backup.sh
```

---

## Team Member Contributions

### Kyle Wisecarver
- **Architecture & Documentation:**  
  Kyle leads the design of the overall network architecture, ensuring that our infrastructure is logically segmented, secure, and scalable. He is responsible for creating detailed network schematics, implementing best-practice security policies (including zero-trust and RBAC), and maintaining comprehensive project documentation to guarantee clarity and adherence to industry standards.

### Ethan
- **Firewall & Networking Setup:**  
  Ethan takes charge of the firewall configuration and networking setup. His responsibilities include installing and configuring UFW and iptables on the Ubuntu Server, establishing robust firewall rules, and ensuring reliable connectivity between the Ubuntu Desktop and the Firewall Server. Ethan’s work ensures that our network infrastructure is fortified against external threats while maintaining optimal performance.

### Jose
- **Assistance & End-User Testing:**  
  Jose supports both the architectural design and the firewall/networking configuration. He is instrumental in performing thorough end-user testing, validating settings for both remote and local users. His role includes system administration tasks, troubleshooting potential issues, and ensuring that the deployment meets all operational and security requirements through rigorous testing and feedback.

---

## Maintenance & Troubleshooting

### Routine Maintenance

- **System Updates:**
  ```sh
  sudo apt update && sudo apt upgrade -y
  ```
- **Log Monitoring:**
  ```sh
  sudo tail -f /var/log/syslog
  sudo tail -f /var/log/backup.log
  ```
- **Firewall & Network Diagnostics:**
  ```sh
  sudo iptables -L -v
  sudo ufw status verbose
  ```
- **SSH Connectivity Verification:**
  ```sh
  ssh artcellar_admin@192.168.1.101 "echo 'SSH connection successful'"
  ```

### Troubleshooting Scenarios

- **Backup Failures:**  
  Verify SSH connectivity, ensure sufficient storage, and review rsync logs.
- **Firewall Anomalies:**  
  Reassess iptables and UFW configurations; examine system logs for irregularities.
- **Network Performance Issues:**  
  Analyze system logs and deploy diagnostic tools to resolve latency or throughput bottlenecks.

---

## Future Scalability & Innovation

### Scalability Initiatives

- **Cloud Integration:**  
  Evaluate hybrid cloud solutions to enhance data redundancy and security.
- **Containerization & Orchestration:**  
  Explore Docker and Kubernetes to deploy containerized services and orchestrate scalable, resilient systems.
- **Automation & AI:**  
  Integrate AI-driven monitoring and automation tools for predictive maintenance and rapid incident resolution.

### Continuous Improvement

- **Innovation Workshops:**  
  Conduct periodic sessions to stay updated on network security advancements and system automation techniques.
- **Stakeholder Engagement:**  
  Maintain an open feedback loop with all team members to drive iterative improvements.
- **Technology Adoption:**  
  Continuously evaluate and incorporate emerging technologies to enhance system performance and security.

---

## Conclusion 

The Wcjc_Network_Troubleshooting_Capstone Project is a transformative initiative designed to showcase advanced competencies in network troubleshooting, security, and systems administration within a small business context. Developed as part of the Information Technology Network and Computer Systems Administrator AAS program, the project focuses on architecting and deploying a robust IT infrastructure for Art Cellar Houston. By leveraging industry-standard platforms such as Ubuntu Desktop, Ubuntu Server, and SQLite, and integrating essential tools like iptables, UFW, rsync, cron, and Bash scripting, our approach establishes a secure, resilient, and scalable environment.

Key strategic objectives include ensuring operational excellence through uninterrupted business operations, implementing a rigorous zero-trust security model that emphasizes continuous authentication and network segmentation, and fostering long-term scalability by adopting advanced automation and monitoring techniques. Our team’s collaborative efforts are driven by clearly defined roles: Kyle leads the network architecture and documentation efforts, ensuring that the system design is both logically structured and comprehensively recorded; Ethan is responsible for the firewall and networking setup, guaranteeing that robust security protocols are in place; and Jose provides critical support with system administration and thorough end-user testing, ensuring that both remote and local access configurations meet stringent performance and security standards.

This capstone project not only exemplifies our technical expertise but also sets a new benchmark for secure, efficient, and future-ready IT infrastructure, positioning Art Cellar Houston for sustained growth and operational success.