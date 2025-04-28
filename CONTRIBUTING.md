# Contributing to Onusphere

This document outlines the workflow for contributing to the Onusphere project. Our repository is structured with Git submodules, which requires a specific workflow to ensure smooth collaboration.

## Table of Contents
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Submitting Changes](#submitting-changes)
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

### 2. Make Sure You're Up-to-Date

Navigate to the appropriate repository and make sure you have the latest changes:

```bash
# For frontend changes
cd frontend
git checkout main
git pull origin main

# For backend changes
cd backend
git checkout main
git pull origin main

# For main repository changes
# First go to the root of the main repository
cd /path/to/Onusphere  # Return to main repo if you were in a submodule
git checkout main
git pull origin main
```

### 3. Make Your Changes

Make changes to the code in the appropriate repository.

### 4. Commit and Push Your Changes

```bash
# Stage your changes
git add .

# Commit your changes
git commit -m "Description of your changes"

# Push your changes to the main branch
git push origin main
```

## Submitting Changes

### For Submodule Changes (Frontend or Backend)

1. Commit and push your changes directly to the main branch of the submodule:

```bash
# In the submodule directory
git add .
git commit -m "Description of your changes"
git push origin main
```

2. Update the submodule reference in the main repository:

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

Commit and push directly to the main repository:

```bash
git add .
git commit -m "Description of your changes"
git push origin main
```

## Coordination

- Communicate with team members before making significant changes
- Let others know when you've pushed changes
- Consider using GitHub issues to track work items

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
2. **Keep submodule changes focused** on a specific task
3. **Update submodules frequently** to stay in sync with teammates
4. **Pull before you start working** to avoid conflicts
5. **Write detailed commit messages** explaining what and why (not how)
6. **Test your changes** before pushing
7. **Push small, incremental changes** rather than large batches

---

If you have any questions or need help, please contact the project maintainer.
