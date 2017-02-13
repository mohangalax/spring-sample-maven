package com.sample.maven.security.picketlink;

import com.sample.maven.constant.Constants;
import com.sample.maven.security.SampleUser;

import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.StringUtils;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.util.Assert;
import org.springframework.util.CollectionUtils;

import java.security.Principal;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Slf4j
public class PicketLinkAuthenticationUserDetailsService
    implements AuthenticationUserDetailsService<PicketLinkAuthenticationToken> {
    /**
     * Role prefix.
     */
    public static final String ROLE_PREFIX = "ROLE_";

    /**
     * Permission prefix.
     */
    public static final String PERMISSION_PREFIX = "PERMISSION_";
    private UserDetailsService userDetailsService = null;
    
    /**
     * @param userDetailsService
     *          the UserDetailsService to delegate to.
     */
    public PicketLinkAuthenticationUserDetailsService(
        final UserDetailsService userDetailsService) {
        Assert.notNull(userDetailsService, "userDetailsService cannot be null.");
        this.userDetailsService = userDetailsService;
    }

    /*
     * (non-Javadoc)
     * @see
     * org.springframework.security.core.userdetails.AuthenticationUserDetailsService#loadUserDetails
     * (org.springframework.security.core.Authentication)
     */
    @Override
    public UserDetails loadUserDetails(
        final PicketLinkAuthenticationToken token)
        throws UsernameNotFoundException {
        final Map<String, List<Object>> attributes = token.getAttributes();
        log.debug("attribute map: {}", attributes);

        String username = ((Principal) token.getPrincipal()).getName();

        if (!CollectionUtils.isEmpty(attributes)) {
            if (attributes.containsKey(Constants.USERNAME)) {
                final List<Object> userNames = attributes.get(Constants.USERNAME);

                if (!CollectionUtils.isEmpty(userNames)) {
                    username = userNames.get(0).toString();
                }
            }
        }

        final SampleUser user = (SampleUser) this.userDetailsService.loadUserByUsername(username);
        final List<GrantedAuthority> authorities = this.loadUserAuthorities(token);

        if (CollectionUtils.isEmpty(authorities)) {
            throw new UsernameNotFoundException(
                "Not enough authority to access the site.");
        }

        final SampleUser sampleUser = new SampleUser(user.getUsername(),
                "", true, true, true, true, authorities);

        if (!CollectionUtils.isEmpty(attributes)) {
            if (attributes.containsKey(Constants.FIRSTNAME)) {
                final List<Object> firstNames = attributes.get(Constants.FIRSTNAME);
                sampleUser.setFirstName(String.valueOf(firstNames.get(0)));
            }

            if (attributes.containsKey(Constants.LASTNAME)) {
                final List<Object> lastNames = attributes.get(Constants.LASTNAME);
                sampleUser.setLastName(String.valueOf(lastNames.get(0)));
            }

            if (attributes.containsKey(Constants.EMAIL)) {
                final List<Object> emails = attributes.get(Constants.EMAIL);
                sampleUser.setEmail(String.valueOf(emails.get(0)));
            }

            if (attributes.containsKey(Constants.DEPARTMENT)) {
                final List<Object> departments = attributes.get(Constants.DEPARTMENT);
                sampleUser.setDepartment(String.valueOf(departments.get(0)));
            }

            if (attributes.containsKey(Constants.PERSON_GUID)) {
                final List<Object> guids = attributes.get(Constants.PERSON_GUID);
                sampleUser.setGuid(String.valueOf(guids.get(0)));
            }
        }

        return sampleUser;
    }

    /**
     * Check whether all required properties have been set.
     */
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.userDetailsService, "UserDetailsService must be set");
    }

    /**
     * Set the wrapped UserDetailsService implementation
     * @param userDetailsService
     *          The wrapped UserDetailsService to set
     */
    public void setUserDetailsService(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * Load user authorities to the Spring context.
     * @param username
     *          the user name.
     * @return list of granted authority
     */
    protected final List<GrantedAuthority> loadUserAuthorities(
        final PicketLinkAuthenticationToken token) {
        final Map<String, List<Object>> attributes = token.getAttributes();
        final List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();

        final List<Object> roles = attributes.get("Role");

        if (CollectionUtils.isEmpty(roles) ||
                ((roles.size() == 1) && roles.contains(Constants.NONE))) {
            throw new UsernameNotFoundException(
                "Not enough authority to access the site.");
        } else {
            for (final Object role : roles) {
                final String strRole = StringUtils.upperCase(String.valueOf(
                            role));

                if (!StringUtils.equalsIgnoreCase(Constants.NONE, strRole)) {
                    final String roleName = ROLE_PREFIX +
                        StringUtils.replace(strRole, " ", "_");
                    log.debug("Role: " + roleName);
                    authorities.add(new SimpleGrantedAuthority(roleName));
                }
            }
        }

        final List<Object> functions = attributes.get("Function");

        if (!CollectionUtils.isEmpty(functions) &&
                !((functions.size() == 1) &&
                functions.contains(Constants.NONE))) {
            for (final Object function : functions) {
                final String strFunction = StringUtils.upperCase(String.valueOf(
                            function));

                if (!StringUtils.equalsIgnoreCase(Constants.NONE, strFunction)) {
                    final String functionName = PERMISSION_PREFIX +
                        StringUtils.replace(strFunction, " ", "_");
                    log.debug("Function: " + functionName);
                    authorities.add(new SimpleGrantedAuthority(functionName));
                }
            }
        }

        return authorities;
    }
}
