# Live Demo Cheatsheet — GitOps with ArgoCD

> Push a git tag → GitHub Actions builds images → updates Helm chart → ArgoCD auto-deploys → UI changes live

---

## Cluster Info

| | URL | Credentials |
|---|---|---|
| **ArgoCD UI** | `https://3.227.242.208:30443` | admin / `t-UuDA-0u61WoJGC` |
| **MERN App** | `http://3.227.242.208:30240` | — |
| **GitHub Actions** | `https://github.com/sasidatta/docker_demo/actions` | — |

---

## Pre-Demo Checklist

- [ ] ArgoCD UI open — `mern-app` shows **Synced + Healthy**
- [ ] App open in browser at `http://3.227.242.208:30240` — confirm current version badge visible
- [ ] GitHub Actions tab open
- [ ] Terminal ready in `docker_demo` repo directory

---

## Deploy v2 (Live Steps)

### 1 — Push the tag
```bash
git tag v2 && git push origin v2
```

### 2 — Show GitHub Actions (~ 2 min)
Open: `https://github.com/sasidatta/docker_demo/actions`

**What audience sees:**
- `Build & Push Docker Images` job running — builds multi-arch `frontend:v2` + `backend:v2`
- `Update Helm & Create GitHub Release` job — bumps `values.yaml` image tags to `v2`, commits back to master

### 3 — Show the auto-commit on GitHub (~30s after Actions completes)
```
chore: bump helm chart to v2 [skip ci]
```
Point out: CI updated `values.yaml` — ArgoCD watches this file.

### 4 — Show ArgoCD detecting the change (~3 min after tag push)
ArgoCD polls Git every 3 minutes. To trigger immediately:
```bash
# Force refresh via CLI (optional, for live demo speed)
kubectl annotate application mern-app -n argocd argocd.argoproj.io/refresh=hard --overwrite
```
Or click **REFRESH** in the ArgoCD UI.

**What audience sees:**
- App goes `OutOfSync` → `Syncing` → `Healthy`
- New pods rolling out (old pods terminate, new ones start)

### 5 — Show the UI update
Refresh `http://3.227.242.208:30240`

**What audience sees:**
- Version badge changes from `v1` → `v2`
- Accent color changes (golden angle formula — each version has a unique hue)

---

## Version Color Reference

| Version | Color | Hue |
|---------|-------|-----|
| v1 | Dark Charcoal | `hsl(0, 65%, 40%)` |
| v2 | `hsl(137, 65%, 40%)` | 137° |
| v3 | `hsl(274, 65%, 40%)` | 274° |
| v4 | `hsl(51, 65%, 40%)` | 51° |
| v5 | `hsl(188, 65%, 40%)` | 188° |

---

## Rapid-Fire Tags (if doing multiple versions live)
```bash
# Each push triggers full pipeline independently
git tag v3 && git push origin v3
git tag v4 && git push origin v4
git tag v5 && git push origin v5
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| ArgoCD not syncing | Click REFRESH or run `kubectl annotate app mern-app -n argocd argocd.argoproj.io/refresh=hard --overwrite` |
| GitHub Actions failed | Check `https://github.com/sasidatta/docker_demo/actions` — likely missing `DOCKERHUB_PASSWORD` secret |
| Pods stuck Pending | Check PVC: `kubectl get pvc -n default` — needs `local-path` StorageClass |
| App not loading | Check frontend NodePort: `kubectl get svc mern-app-frontend -n default` |
| Wrong version showing | Hard refresh browser (Cmd+Shift+R) — nginx may have cached old assets |
