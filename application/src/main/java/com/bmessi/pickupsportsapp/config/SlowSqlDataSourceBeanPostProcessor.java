package com.bmessi.pickupsportsapp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.*;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

/**
 * Wraps the primary DataSource to log slow SQL statements.
 * Enable by setting slow.sql.threshold-ms > 0 (default disabled).
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class SlowSqlDataSourceBeanPostProcessor implements BeanPostProcessor {

    private static final Logger log = LoggerFactory.getLogger("SlowSql");

    @Value("${slow.sql.threshold-ms:0}")
    private long thresholdMs;

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (thresholdMs <= 0) return bean;
        if (bean instanceof DataSource ds) {
            return Proxy.newProxyInstance(
                    ds.getClass().getClassLoader(),
                    new Class[]{DataSource.class},
                    new DataSourceHandler(ds, thresholdMs)
            );
        }
        return bean;
    }

    private static class DataSourceHandler implements InvocationHandler {
        private final DataSource target;
        private final long thresholdMs;

        DataSourceHandler(DataSource target, long thresholdMs) {
            this.target = target;
            this.thresholdMs = thresholdMs;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            Object result = method.invoke(target, args);
            if (("getConnection".equals(method.getName()) || "getConnection".equals(method.getName()))
                    && result instanceof Connection conn) {
                return Proxy.newProxyInstance(
                        conn.getClass().getClassLoader(),
                        new Class[]{Connection.class},
                        new ConnectionHandler(conn, thresholdMs)
                );
            }
            return result;
        }
    }

    private static class ConnectionHandler implements InvocationHandler {
        private final Connection target;
        private final long thresholdMs;

        ConnectionHandler(Connection target, long thresholdMs) {
            this.target = target;
            this.thresholdMs = thresholdMs;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            Object result = method.invoke(target, args);
            if (result instanceof PreparedStatement ps && "prepareStatement".equals(method.getName())) {
                String sql = (String) args[0];
                return Proxy.newProxyInstance(
                        ps.getClass().getClassLoader(),
                        new Class[]{PreparedStatement.class},
                        new StatementHandler(ps, sql, thresholdMs)
                );
            }
            if (result instanceof Statement st && ("createStatement".equals(method.getName()))) {
                return Proxy.newProxyInstance(
                        st.getClass().getClassLoader(),
                        new Class[]{Statement.class},
                        new StatementHandler(st, null, thresholdMs)
                );
            }
            return result;
        }
    }

    private static class StatementHandler implements InvocationHandler {
        private final Object target;
        private final String sqlTemplate;
        private final long thresholdMs;

        StatementHandler(Object target, String sqlTemplate, long thresholdMs) {
            this.target = target;
            this.sqlTemplate = sqlTemplate;
            this.thresholdMs = thresholdMs;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            String name = method.getName();
            boolean executeCall = name.startsWith("execute");
            if (!executeCall) {
                return method.invoke(target, args);
            }
            long start = System.nanoTime();
            try {
                return method.invoke(target, args);
            } finally {
                long durMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);
                if (durMs >= thresholdMs) {
                    String cid = MDC.get("cid");
                    String sql = resolveSql(target, sqlTemplate);
                    log.warn("SLOW-SQL cid={} durationMs={} sql={}", cid, durMs, sanitize(sql));
                }
            }
        }

        private static String resolveSql(Object target, String template) {
            if (template != null) return template;
            try {
                // Try to fetch recent SQL from Statement if available
                Method m = target.getClass().getMethod("toString");
                return Objects.toString(m.invoke(target), "N/A");
            } catch (Exception e) {
                return "N/A";
            }
        }

        private static String sanitize(String sql) {
            if (sql == null) return "";
            return sql.replaceAll("\\s+", " ").trim();
        }
    }
}
