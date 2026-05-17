# Changelog

## 0.1.2 (2026-05-17)

* Added readiness and liveness probes to backend and frontend deployments
* Fixed backend image tag (was 41-char invalid SHA, now `latest`)
* Reduced frontend replicas from 5 to 2
* Added standard `app.kubernetes.io/name` and `app.kubernetes.io/version` labels to `_helpers.tpl`

## 0.1.1 (2026-05-03)

* Updated backend image
