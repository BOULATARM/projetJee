package com.lias.aspect;

import com.lias.security.UserPrincipal;
import com.lias.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogService auditLogService;

    @Around("execution(* com.lias.service.impl.*ServiceImpl.*(..))" +
            " && !execution(* com.lias.service.impl.AuditLogServiceImpl.*(..))" +
            " && !execution(* com.lias.service.impl.NotificationServiceImpl.*(..))")
    public Object auditServiceCall(ProceedingJoinPoint pjp) throws Throwable {
        String methodName = pjp.getSignature().getName();

        // Only audit write operations
        if (isReadMethod(methodName)) {
            return pjp.proceed();
        }

        String entityName = extractEntityName(pjp.getTarget().getClass().getSimpleName());
        String action = resolveAction(methodName);
        String utilisateur = getCurrentUser();
        Long membreId = getCurrentMembreId();
        String details = buildDetails(methodName, pjp.getArgs());

        Object result = pjp.proceed();

        try {
            auditLogService.log(entityName, action, methodName, utilisateur, membreId, details);
        } catch (Exception e) {
            log.warn("Audit log failed for {}.{}: {}", entityName, methodName, e.getMessage());
        }

        return result;
    }

    private boolean isReadMethod(String name) {
        return name.startsWith("get") || name.startsWith("find") || name.startsWith("load")
                || name.startsWith("search") || name.startsWith("count") || name.startsWith("list")
                || name.startsWith("exists") || name.startsWith("fetch");
    }

    private String extractEntityName(String className) {
        return className.replace("ServiceImpl", "");
    }

    private String resolveAction(String methodName) {
        if (methodName.startsWith("creer") || methodName.startsWith("create")
                || methodName.startsWith("ajouter") || methodName.startsWith("soumettre")
                || methodName.startsWith("upload") || methodName.startsWith("generer")
                || methodName.startsWith("publier") || methodName.startsWith("enregistrer")) {
            return "CREATE";
        }
        if (methodName.startsWith("modifier") || methodName.startsWith("update")
                || methodName.startsWith("change") || methodName.startsWith("marquer")
                || methodName.startsWith("accepter") || methodName.startsWith("refuser")
                || methodName.startsWith("valider") || methodName.startsWith("desactiver")
                || methodName.startsWith("reactiver") || methodName.startsWith("envoyer")
                || methodName.startsWith("uploadPV")) {
            return "UPDATE";
        }
        if (methodName.startsWith("supprimer") || methodName.startsWith("delete")
                || methodName.startsWith("remove") || methodName.startsWith("effacer")) {
            return "DELETE";
        }
        return "ACTION";
    }

    private String getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()
                    && !"anonymousUser".equals(auth.getPrincipal())) {
                return auth.getName();
            }
        } catch (Exception ignored) {}
        return "system";
    }

    private Long getCurrentMembreId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
                return up.getMembreId();
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String buildDetails(String method, Object[] args) {
        if (args == null || args.length == 0) return "";
        StringBuilder sb = new StringBuilder();
        for (Object arg : args) {
            if (arg == null) continue;
            if (arg instanceof Long || arg instanceof Integer
                    || arg instanceof String || arg instanceof Enum) {
                sb.append(arg).append(" | ");
            }
        }
        String result = sb.toString();
        if (result.endsWith(" | ")) result = result.substring(0, result.length() - 3);
        return result.length() > 500 ? result.substring(0, 500) : result;
    }
}
