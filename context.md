# Spreadsheet Management System – AI Agent Context

## Overview

This document provides the **context, architecture, and development guidelines** for an AI agent assisting in the development of a **Shared Spreadsheet Management System**.

The goal of the system is to **transform spreadsheets into dynamic database tables**, allowing users to **operate directly on rows instead of raw spreadsheet files**. Each spreadsheet becomes a structured dataset where rows, columns, and attachments can be managed collaboratively.

The system should support **team-based access**, **row-level operations**, and **file attachments within cells**, while maintaining **auditability and scalability**.

---

# System Purpose

The platform enables teams to:

- Upload and manage spreadsheets collaboratively
- Convert spreadsheets into **dynamic database tables**
- Manipulate **rows and columns programmatically**
- Attach **files (PDFs and images)** to specific cells
- Filter, search, and export spreadsheet data
- Maintain access control by **teams and roles**

The system is intended to behave more like a **data workspace** than a traditional spreadsheet tool.

---

# Technology Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Architecture:** Modular architecture using NestJS modules
- **Programming style:** Hybrid Functional + Object-Oriented

### Frontend
- **Framework:** Angular

### Database
Possible options:

- **SQL Server (preferred)** for relational and structured queries
- **Non-relational database** as an alternative if dynamic schema becomes complex

### File Storage
- **Google Cloud Storage (GCS)**  
Equivalent to AWS S3. Used to store file attachments linked to spreadsheet cells.

### Deployment
- **Cloud Provider:** Google Cloud Platform (GCP)

Environments:

- Homologation (staging)
- Production

### Version Control and CI/CD

- **Repository:** GitHub
- **CI/CD:** GitHub Actions

---

# User Roles

Two primary roles exist in the system.

## ADMIN

Admins have full control over system resources.

Capabilities:

- Manage users
  - Create users
  - Edit users
  - Remove users

- Manage teams
  - Create teams
  - Associate teams with clients

- Manage spreadsheets
  - Add spreadsheets
  - Remove spreadsheets

- Data management
  - View rows as **key-value representation**
  - Edit rows in **key-value representation**
  - Add or remove **columns**
  - Add or remove **rows**

- File management
  - View files attached to cells
  - Remove specific attachments

- Export
  - Generate **CSV exports** of any spreadsheet

---

## USER

Regular users have access restricted to their team.

Capabilities:

- Create spreadsheets visible to their **entire team**
- View spreadsheets belonging to their **team or assigned access**

- Data operations
  - View rows in **key-value format**
  - Add or remove **rows**
  - Add or remove **columns**

- File management
  - View attachments linked to cells
  - Remove specific attachments

- Export
  - Generate **CSV export** of spreadsheets they have permission to access

- Authentication
  - Reset password (forgot password flow)

---

# Spreadsheet Functional Requirements

Every spreadsheet must support:

### Dynamic Structure

- Editable **rows**
- Editable **columns**

This implies **dynamic table schemas**.

---

### File Attachments

Cells may contain:

- PDF files
- Image files

These files will be stored in **Google Cloud Storage** and referenced in the database.

---

### Data Visualization

Rows must be separated into **two visual blocks**:

Block 1:
- `In Progress`
- `Waiting Validation`

Block 2:
- `Validated`
- `Completed`

These blocks represent the **status of each row**.

---

### Row Editing

When the user:

- Double-clicks a row  
OR
- Clicks an **Edit** button

The system should open a **modal window** containing editable fields.

Fields should be presented in **key-value format**.

---

### Search

A search input must allow users to:

- Search for a specific **process**
- Return only rows matching the search query

---

### Filters

The table must support **multiple filters**.

Known filters:

- Status
- Date
- Two additional filters (TBD)

Total expected filters: **4**

---

### Export

Users must be able to generate a **CSV file** containing the spreadsheet data.

Export permissions depend on the user's role and spreadsheet access.

---

# Non-Functional Requirements

### Authentication

- Login and password authentication
- Password hashing using **bcrypt**

---

### File Upload Limits

Each attached file will have a **maximum size limit** (to be defined).

---

### Availability

The application should operate with **high availability**, running in cloud infrastructure.

Exact SLA is **to be defined**.

---

### Real-Time Updates

Spreadsheet updates should be reflected **simultaneously for users**.

Possible implementations:

- Webhooks
- WebSockets
- Event-driven updates

---

# Code Design Guidelines

The system must prioritize **semantic and maintainable code**, even if it sacrifices some performance optimizations.

---

## Architecture Principles

Use **NestJS modular architecture**.

Each major domain should be represented by a module.

Examples:

- AuthModule
- UsersModule
- TeamsModule
- SpreadsheetsModule
- AttachmentsModule
- ExportModule

---

## Programming Paradigm

Use a combination of:

- Functional programming
- Object-oriented programming

---

## Classes

Classes should be used for:

- Entities
- Use cases
- Services
- DTOs

---

## Function Responsibilities

Functions should:

- Have **single responsibility**
- Avoid excessive complexity
- Remain **short and readable**

---

## Use Cases

Business logic should be implemented using **Use Case classes**.

Example:
CreateSpreadsheetUseCaseV2
DeleteSpreadsheetByIdUseCase
GetSpreadsheetInformationUseCase


Controllers should **not contain business logic**.

---

## DTO Usage

If a function receives **more than three parameters**, a **DTO (Data Transfer Object)** must be used.

Example:
ColumnDto
SpreadsheetFiltersDto
CreateSpreadsheetDto


---

## Code Flow

All operations should follow the same structure:

Example:

1. Validate input
2. Execute business logic
3. Return response

---

# Expected System Characteristics

The system should behave like:

- A **collaborative spreadsheet workspace**
- A **dynamic table management system**
- A **structured data tool built on spreadsheet concepts**

The architecture should prioritize:

- Maintainability
- Clear domain separation
