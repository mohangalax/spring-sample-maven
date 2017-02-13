package com.sample.maven.security.picketlink;

import org.springframework.beans.factory.InitializingBean;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.core.authority.mapping.NullAuthoritiesMapper;
import org.springframework.security.core.userdetails.AuthenticationUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.util.Assert;


public class PicketLinkAuthenticationProvider implements AuthenticationProvider,
    InitializingBean {
    /** The authentication user details service. */
    private AuthenticationUserDetailsService<PicketLinkAuthenticationToken> authenticationUserDetailsService;

    /** The authorities mapper. */
    private GrantedAuthoritiesMapper authoritiesMapper = new NullAuthoritiesMapper();

    /*
     * (non-Javadoc)
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
     */
    @Override
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.authenticationUserDetailsService,
            "The authenticationUserDetailsService must be set");
    }

    /*
     * (non-Javadoc)
     * @see
     * org.springframework.security.authentication.AuthenticationProvider#authenticate(org.springframework
     * .security.core.Authentication)
     */
    @Override
    public Authentication authenticate(final Authentication authentication)
        throws AuthenticationException {
        if (!supports(authentication.getClass())) {
            return null;
        }

        if (authentication instanceof PicketLinkAuthenticationToken) {
            final PicketLinkAuthenticationToken token = (PicketLinkAuthenticationToken) authentication;
            final UserDetails userDetails = authenticationUserDetailsService.loadUserDetails(token);

            return new PicketLinkAuthenticationToken(userDetails,
                token.getCredentials(), userDetails.getAuthorities(),
                token.getAssertion());
        }

        return null;
    }

    /*
     * (non-Javadoc)
     * @see
     * org.springframework.security.authentication.AuthenticationProvider#supports(java.lang.Class)
     */
    @Override
    public boolean supports(final Class<?> authentication) {
        return PicketLinkAuthenticationToken.class.isAssignableFrom(authentication);
    }

    /**
     * Gets the authentication user details service.
     * @return the authentication user details service
     */
    public AuthenticationUserDetailsService<PicketLinkAuthenticationToken> getAuthenticationUserDetailsService() {
        return authenticationUserDetailsService;
    }

    /**
     * Sets the authentication user details service.
     * @param authenticationUserDetailsService
     *          the new authentication user details service
     */
    public void setAuthenticationUserDetailsService(
        final AuthenticationUserDetailsService<PicketLinkAuthenticationToken> authenticationUserDetailsService) {
        this.authenticationUserDetailsService = authenticationUserDetailsService;
    }

    /**
     * Gets the authorities mapper.
     * @return the authorities mapper
     */
    public GrantedAuthoritiesMapper getAuthoritiesMapper() {
        return authoritiesMapper;
    }

    /**
     * Sets the authorities mapper.
     * @param authoritiesMapper
     *          the new authorities mapper
     */
    public void setAuthoritiesMapper(
        final GrantedAuthoritiesMapper authoritiesMapper) {
        this.authoritiesMapper = authoritiesMapper;
    }
}
