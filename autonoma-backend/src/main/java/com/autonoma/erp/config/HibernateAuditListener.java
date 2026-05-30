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
            EventListenerRegistry registry = sessionFactory.getServiceRegistry().getService(EventListenerRegistry.class);
            registry.getEventListenerGroup(EventType.PRE_INSERT).appendListener(this);
            registry.getEventListenerGroup(EventType.PRE_UPDATE).appendListener(this);
        } catch (Exception e) {
            System.err.println("Failed to register Hibernate dynamic audit event listeners: " + e.getMessage());
        }
    }

    @Override
    public boolean onPreInsert(PreInsertEvent event) {
        String currentUser = SecurityUtils.getCurrentUserEmployeeName();
        if (currentUser == null) {
            currentUser = "Admin"; // Fallback to Admin for default data/migrations if session is missing
        }

        String[] propertyNames = event.getPersister().getPropertyNames();
        Object[] state = event.getState();

        setValue(propertyNames, state, "createdUser", currentUser);
        setValue(propertyNames, state, "createdBy", currentUser);

        return false; // do not veto insert
    }

    @Override
    public boolean onPreUpdate(PreUpdateEvent event) {
        String currentUser = SecurityUtils.getCurrentUserEmployeeName();
        if (currentUser == null) {
            currentUser = "Admin"; // Fallback
        }

        String[] propertyNames = event.getPersister().getPropertyNames();
        Object[] state = event.getState();

        setValue(propertyNames, state, "updatedUser", currentUser);
        setValue(propertyNames, state, "updatedBy", currentUser);

        return false; // do not veto update
    }

    private void setValue(String[] propertyNames, Object[] state, String propertyName, Object value) {
        for (int i = 0; i < propertyNames.length; i++) {
            if (propertyNames[i].equalsIgnoreCase(propertyName)) {
                state[i] = value;
                break;
            }
        }
    }
}
