package com.autonoma.erp.config;

import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.*;
import org.hibernate.internal.SessionFactoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import com.autonoma.erp.util.SecurityUtils;

@Component
public class HibernateAuditListener implements PreInsertEventListener, PreUpdateEventListener {

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @PostConstruct
    public void registerListeners() {
        try {
            SessionFactoryImpl sessionFactory = entityManagerFactory.unwrap(SessionFactoryImpl.class);
            EventListenerRegistry registry = sessionFactory.getServiceRegistry()
                    .getService(EventListenerRegistry.class);
            registry.getEventListenerGroup(EventType.PRE_INSERT).appendListener(this);
            registry.getEventListenerGroup(EventType.PRE_UPDATE).appendListener(this);
        } catch (Exception e) {
            System.err.println("Failed to register Hibernate dynamic audit event listeners: " + e.getMessage());
        }
    }

    @Override
    public boolean onPreInsert(PreInsertEvent event) {
        String currentUser = SecurityUtils.getCurrentUserId();
        if (currentUser == null) {
            currentUser = "admin"; // Fallback to Admin for default data/migrations if session is missing
        }

        String[] propertyNames = event.getPersister().getPropertyNames();
        Object[] state = event.getState();

        setValue(propertyNames, state, "createdUser", currentUser, event.getEntity());
        setValue(propertyNames, state, "createdBy", currentUser, event.getEntity());

        return false; // do not veto insert
    }

    @Override
    public boolean onPreUpdate(PreUpdateEvent event) {
        String[] propertyNames = event.getPersister().getPropertyNames();
        Object[] state = event.getState();

        // Deep fix: Skip updating audit fields if the record was newly created within
        // the last second
        java.util.Date createdDate = null;
        for (int i = 0; i < propertyNames.length; i++) {
            if (propertyNames[i].equalsIgnoreCase("createdDate") || propertyNames[i].equalsIgnoreCase("createdAt")) {
                if (state[i] instanceof java.util.Date) {
                    createdDate = (java.util.Date) state[i];
                }
                break;
            }
        }
        if (createdDate != null && (new java.util.Date().getTime() - createdDate.getTime() < 1000)) {
            return false;
        }

        String currentUser = SecurityUtils.getCurrentUserId();
        if (currentUser == null) {
            currentUser = "admin"; // Fallback
        }

        setValue(propertyNames, state, "updatedUser", currentUser, event.getEntity());
        setValue(propertyNames, state, "updatedBy", currentUser, event.getEntity());

        java.util.Date now = new java.util.Date();
        setValue(propertyNames, state, "updatedDate", now, event.getEntity());
        setValue(propertyNames, state, "updatedAt", now, event.getEntity());

        return false; // do not veto update
    }

    private void setValue(String[] propertyNames, Object[] state, String propertyName, Object value, Object entity) {
        for (int i = 0; i < propertyNames.length; i++) {
            if (propertyNames[i].equalsIgnoreCase(propertyName)) {
                System.out.println("[AuditListener] Setting " + propertyName + " to " + value + " on "
                        + entity.getClass().getSimpleName());
                state[i] = value;
                try {
                    // Also update the entity object itself using reflection
                    String setterName = "set" + propertyName.substring(0, 1).toUpperCase() + propertyName.substring(1);
                    java.lang.reflect.Method setter = null;
                    for (java.lang.reflect.Method method : entity.getClass().getMethods()) {
                        if (method.getName().equalsIgnoreCase(setterName) && method.getParameterCount() == 1) {
                            setter = method;
                            break;
                        }
                    }
                    if (setter != null) {
                        setter.invoke(entity, value);
                    } else {
                        // Try field directly if setter is missing (e.g. some lombok setups)
                        java.lang.reflect.Field field = null;
                        Class<?> current = entity.getClass();
                        while (current != null && field == null) {
                            try {
                                field = current.getDeclaredField(propertyName);
                            } catch (NoSuchFieldException e) {
                                current = current.getSuperclass();
                            }
                        }
                        if (field != null) {
                            field.setAccessible(true);
                            field.set(entity, value);
                        }
                    }
                } catch (Exception e) {
                    System.err.println(
                            "[AuditListener] Reflection error setting " + propertyName + ": " + e.getMessage());
                }
                break;
            }
        }
    }
}
