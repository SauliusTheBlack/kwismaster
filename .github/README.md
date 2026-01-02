# GitHub Actions Workflows

## Release Workflow

The `release.yml` workflow automatically builds and releases the Kwismaster Presenter Kit when changes are merged to the `main` branch.

### Automatic Versioning

The workflow uses **semantic versioning** (MAJOR.MINOR.PATCH) based on commit messages:

#### Version Bump Rules

| Commit Message Prefix | Version Bump | Example |
|----------------------|--------------|---------|
| `BREAKING CHANGE:` or `breaking:` | **Major** (1.0.0) | `1.2.3` → `2.0.0` |
| `feat:` or `feature:` | **Minor** (0.1.0) | `1.2.3` → `1.3.0` |
| `fix:` or `bugfix:` | **Patch** (0.0.1) | `1.2.3` → `1.2.4` |
| Any other message | **Minor** (0.1.0) | `1.2.3` → `1.3.0` |

#### Examples

**For a new feature (minor version bump):**
```bash
git commit -m "feat: add display presentation mode to scorekeeper"
# Result: 1.2.3 → 1.3.0
```

**For a bug fix (patch version bump):**
```bash
git commit -m "fix: correct timer display issue in presentation mode"
# Result: 1.2.3 → 1.2.4
```

**For a breaking change (major version bump):**
```bash
git commit -m "BREAKING CHANGE: redesign quiz data format structure"
# Result: 1.2.3 → 2.0.0
```

### What the Workflow Does

1. **Determines version bump type** by analyzing commit messages since the last tag
2. **Calculates new version number** based on the bump type
3. **Creates a demo `quiz_data.js`** file with sample questions
4. **Creates a `VERSION.txt`** file with build information
5. **Packages the kit** into a zip file (excludes git files, node_modules, etc.)
6. **Creates a GitHub Release** with the new version tag
7. **Uploads the zip** as both a release asset and workflow artifact

### Manual Versioning (Optional)

If you want to manually create a release with a specific version:

```bash
# Create and push a tag
git tag v1.5.0
git push origin v1.5.0

# The workflow will use this tag as the starting point for the next version
```

### Artifacts

- **Release Assets**: Permanently attached to GitHub releases
- **Workflow Artifacts**: Available for 90 days in the Actions tab

### First Release

If no tags exist in the repository, the workflow will start at version `0.1.0` (or `0.0.1` for a fix, `1.0.0` for a breaking change).
