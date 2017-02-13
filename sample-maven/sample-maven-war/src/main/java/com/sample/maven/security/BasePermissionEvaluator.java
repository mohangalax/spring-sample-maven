package com.sample.maven.security;

import lombok.extern.slf4j.Slf4j;

import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;

import java.io.Serializable;


@Slf4j
public class BasePermissionEvaluator implements PermissionEvaluator {
	
    /**
     * This method will evaluate the permission for the user. The permissions as stored in the
     * authorities object.
     * @param authentication
     *          is the User authentication in the session.
     * @param targetDomainObject
     *          checking permission on this object.
     * @param permission
     *          this is the permission name that will be checked against the authorities for the user.
     * @return a boolean if the user has or not permission.
     */
    @Override
    public final boolean hasPermission(final Authentication authentication,
        final Object targetDomainObject, final Object permission) {
        Authentication auth = authentication;

        if (auth == null) {
            log.error(
                "Authentication is NULL for the method hasPermission under BasePermissionEvaluator." +
                " We shouldn't have this error.");
            auth = SecurityContextHolder.getContext().getAuthentication();
        }

        final Object principal = auth.getPrincipal();
        User userDetails = null;

        if (principal instanceof User) {
            userDetails = (User) principal;
            log.debug("LOG1: Does " + userDetails.getUsername() +
                " has permission \"" + permission + "\" ?");

            final GrantedAuthority grantedAuthority = new SimpleGrantedAuthority((String) permission);

            if (userDetails.getAuthorities().contains(grantedAuthority)) {
                log.debug("LOG2: TRUE.");

                return true;
            } else {
                log.debug("LOG2: FALSE.");

                return false;
            }
        }

        log.debug("LOG3: User is invalid in the session.");

        return false;
    }

    /**
     * Not implemented as we are not supporting yet the Serializable objects permission check.
     * @param authentication
     *          user object.
     * @param targetId
     *          object id.
     * @param targetType
     *          object type.
     * @param permission
     *          name.
     * @return boolean.
     */
    @Override
    public final boolean hasPermission(final Authentication authentication,
        final Serializable targetId, final String targetType,
        final Object permission) {
        throw new RuntimeException(
            "Id and Class permissions are not supperted by this application");
    }
}
