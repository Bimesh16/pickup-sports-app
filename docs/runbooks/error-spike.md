# High Error Rate Runbook

1. **Check Dashboards**
   - Review the error rate panel on Grafana to confirm the spike.
   - Correlate with deployment timelines or external incidents.
2. **Inspect Logs**
   - Examine application logs for stack traces or unusual patterns.
3. **Mitigate**
   - Roll back recent changes or scale the service if needed.
4. **Escalate**
   - If the issue persists, page the on-call engineer via PagerDuty and open an incident.
