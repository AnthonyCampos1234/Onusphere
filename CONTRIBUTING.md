# Contributing to Onusphere

This document outlines the workflow for contributing to the Onusphere project. Our repository is structured with Git submodules, which requires a specific workflow to ensure smooth collaboration.

## Table of Contents
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Submitting Changes](#submitting-changes)
- [Code Reviews](#code-reviews)
- [Common Issues with Submodules](#common-issues-with-submodules)

## Repository Structure

Onusphere is structured as follows:
- **Main Repository** ([Onusphere](https://github.com/AnthonyCampos1234/Onusphere)): Contains project-wide configurations and documentation
- **Frontend Submodule** ([Onusphere-frontend](https://github.com/AnthonyCampos1234/Onusphere-frontend)): Contains all frontend code
- **Backend Submodule** ([Onusphere-backend](https://github.com/AnthonyCampos1234/Onusphere-backend)): Contains all backend code

## Getting Started

### 1. Clone the Repository

```bash
# Clone the main repository with all submodules
git clone --recurse-submodules https://github.com/AnthonyCampos1234/Onusphere.git
cd Onusphere
```

If you've already cloned the repository without the `--recurse-submodules` flag, you can initialize the submodules with:

```bash
git submodule update --init --recursive
```

### 2. Set Up Development Environment

Follow the README instructions in each submodule to set up your development environment.

### 3. Make Sure You Have Access

Ensure you have been added as a collaborator to all three repositories:
- Main repository: [Onusphere](https://github.com/AnthonyCampos1234/Onusphere)
- Frontend repository: [Onusphere-frontend](https://github.com/AnthonyCampos1234/Onusphere-frontend)
- Backend repository: [Onusphere-backend](https://github.com/AnthonyCampos1234/Onusphere-backend)

## Development Workflow

### 1. Decide Where Your Changes Will Go

Before you start working, determine which submodule your changes will affect:
- Frontend changes → Frontend submodule
- Backend changes → Backend submodule
- Project-wide changes (documentation, configuration, etc.) → Main repository

### 2. Create a Feature Branch

Navigate to the appropriate repository and create a feature branch:

```bash
# For frontend changes
cd frontend
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# For backend changes
cd backend
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# For main repository changes
# First go to the root of the main repository
cd /path/to/Onusphere  # Return to main repo if you were in a submodule
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

Make changes to the code in the appropriate repository.

### 4. Commit and Push Your Changes

```bash
# Stage your changes
git add .

# Commit your changes
git commit -m "Description of your changes"

# Push your branch to the remote repository
git push -u origin feature/your-feature-name
```

## Branching Strategy

We follow a simplified Git Flow approach:

- `main`: Always contains stable, production-ready code
- `develop`: Integration branch for features (optional, use if project size grows)
- `feature/*`: For new features or changes
- `bugfix/*`: For bug fixes
- `hotfix/*`: For critical fixes to production

## Submitting Changes

### For Submodule Changes (Frontend or Backend)

1. Submit a Pull Request (PR) in the respective submodule repository
2. Once the PR is approved and merged into the submodule's `main` branch
3. Update the submodule reference in the main repository:

```bash
# In the main repository
cd /path/to/Onusphere
cd frontend  # or backend
git checkout main
git pull origin main
cd ..
git add frontend  # or backend
git commit -m "Update frontend submodule to latest commit"
git push origin main
```

### For Main Repository Changes

Submit a PR directly to the main repository.

## Code Reviews

- All changes require at least one review before merging
- Use GitHub's PR features to request reviews
- Address all comments and ensure all tests pass before merging

## Common Issues with Submodules

### 1. Submodule is in 'detached HEAD' state

This happens when you're not on a branch in your submodule:

```bash
# Inside the submodule
git checkout main
```

### 2. Changes in submodule not reflected in main repository

After committing changes to a submodule, you need to commit the updated reference in the main repository:

```bash
# In the main repository
git add frontend  # or backend
git commit -m "Update submodule reference"
git push
```

### 3. Pulling changes that include submodule updates

When someone else updates a submodule, you need to:

```bash
git pull
git submodule update --recursive
```

### 4. Conflicts in submodules

Handle conflicts in the submodule first, then update the reference in the main repository.

---

## Best Practices

1. **Communicate before starting work** to avoid duplicate efforts
2. **Keep submodule changes focused** on a single feature or bug fix
3. **Update submodules frequently** to stay in sync with teammates
4. **Always create a feature branch** for your changes
5. **Write detailed commit messages** explaining what and why (not how)
6. **Run tests locally** before submitting PRs
7. **Keep PRs small and focused** for easier reviews

---

If you have any questions or need help, please contact the project maintainer.
