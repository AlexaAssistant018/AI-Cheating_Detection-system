# Contributing to AI Cheating Detection System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, versions)

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add: feature description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Guidelines

### Code Style

**JavaScript/React**
- Use ES6+ features
- Functional components with hooks
- Meaningful variable names
- Add comments for complex logic
- Follow existing code structure

**Python**
- Follow PEP 8 style guide
- Use type hints where applicable
- Add docstrings for functions
- Keep functions focused and small

### Commit Messages

Format: `Type: Description`

Types:
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Update existing feature
- `Refactor:` Code refactoring
- `Docs:` Documentation changes
- `Style:` Code style changes
- `Test:` Add or update tests

Examples:
- `Add: Multiple face detection feature`
- `Fix: Camera permission issue on Safari`
- `Update: Improve detection accuracy`

### Testing

- Test all changes locally
- Ensure existing features still work
- Add tests for new features
- Test on multiple browsers

### Documentation

- Update README.md if needed
- Add comments for complex code
- Update API documentation
- Include examples for new features

## Project Structure

```
frontend/     - React application
backend/      - Node.js API
ai-module/    - Python Flask AI service
```

## Areas for Contribution

### High Priority
- [ ] Improve face detection accuracy
- [ ] Add head pose estimation
- [ ] Implement phone detection
- [ ] Add eye tracking
- [ ] Improve UI/UX

### Medium Priority
- [ ] Add more test coverage
- [ ] Improve documentation
- [ ] Add internationalization
- [ ] Performance optimizations
- [ ] Mobile responsiveness

### Low Priority
- [ ] Add dark mode
- [ ] Export reports to PDF
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Integration with LMS

## Getting Help

- Read the documentation
- Check existing issues
- Ask questions in Discussions
- Contact maintainers

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the project
- Show empathy towards others

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing! 🎉
