# Release History

> Each release is triggered by a git tag (`git tag vN && git push origin vN`).
> GitHub Actions builds multi-arch Docker images and auto-updates the Helm chart.
> ArgoCD detects the Helm change and deploys automatically.

---

## Version Summary

| Version | Theme | Color | Frontend Image | Backend Image | Helm Chart |
|---------|-------|-------|----------------|---------------|------------|
| v5 | Amber | `#d97706` | `mern-docker-frontend:v5` | `mern-docker-backend:v5` | `0.1.6` |
| v4 | Royal Purple | `#7c3aed` | `mern-docker-frontend:v4` | `mern-docker-backend:v4` | `0.1.5` |
| v3 | Emerald Green | `#059669` | `mern-docker-frontend:v3` | `mern-docker-backend:v3` | `0.1.4` |
| v2 | Ocean Blue | `#1d4ed8` | `mern-docker-frontend:v2` | `mern-docker-backend:v2` | `0.1.3` |
| v1 | Dark Charcoal | `#111827` | `mern-docker-frontend:v1` | `mern-docker-backend:v1` | `0.1.2` |

---

## v5 — Amber

**Released:** TBD
**Theme:** Amber (`#d97706`)

### Changes
- UI accent color updated to amber/orange
- Version badge displays `v5` in header

### Images
```
sasidatta/mern-docker-frontend:v5
sasidatta/mern-docker-backend:v5
```

### Deploy
```bash
git tag v5 && git push origin v5
# ArgoCD auto-syncs, or manually:
helm upgrade mern ./mern-docker/helm/mern-app --set frontend.image.tag=v5 --set backend.image.tag=v5
```

---

## v4 — Royal Purple

**Released:** TBD
**Theme:** Royal Purple (`#7c3aed`)

### Changes
- UI accent color updated to purple
- Version badge displays `v4` in header

### Images
```
sasidatta/mern-docker-frontend:v4
sasidatta/mern-docker-backend:v4
```

### Deploy
```bash
git tag v4 && git push origin v4
```

---

## v3 — Emerald Green

**Released:** TBD
**Theme:** Emerald Green (`#059669`)

### Changes
- UI accent color updated to green
- Version badge displays `v3` in header

### Images
```
sasidatta/mern-docker-frontend:v3
sasidatta/mern-docker-backend:v3
```

### Deploy
```bash
git tag v3 && git push origin v3
```

---

## v2 — Ocean Blue

**Released:** TBD
**Theme:** Ocean Blue (`#1d4ed8`)

### Changes
- UI accent color updated to blue
- Version badge displays `v2` in header

### Images
```
sasidatta/mern-docker-frontend:v2
sasidatta/mern-docker-backend:v2
```

### Deploy
```bash
git tag v2 && git push origin v2
```

---

## v1 — Dark Charcoal

**Released:** TBD
**Theme:** Dark Charcoal (`#111827`)

### Changes
- Initial release
- Version badge displays `v1` in header
- Multi-arch images (amd64 + arm64)

### Images
```
sasidatta/mern-docker-frontend:v1
sasidatta/mern-docker-backend:v1
```

### Deploy
```bash
git tag v1 && git push origin v1
```
