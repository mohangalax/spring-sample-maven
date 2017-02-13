package com.sample.maven.security;

import lombok.extern.slf4j.Slf4j;

import org.springframework.ldap.core.DirContextAdapter;
import org.springframework.ldap.core.DirContextOperations;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;

import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;


@Slf4j
@Service
public class SampleUserDetailsService implements UserDetailsService,
    LdapAuthoritiesPopulator, UserDetailsContextMapper {
    @Override
    public UserDetails loadUserByUsername(final String username)
        throws UsernameNotFoundException {
        log.info("Sample User --> " + username);

        final SampleUser user = new SampleUser(username, "empty",
                true, true, true, true,
                Collections.<GrantedAuthority>emptyList());

        return user;
    }

    @Override
    public UserDetails mapUserFromContext(DirContextOperations arg0,
        String arg1, Collection<?extends GrantedAuthority> arg2) {
        log.info("Everything smooth --> mapUserFromContext");

        return null;
    }

    @Override
    public void mapUserToContext(UserDetails arg0, DirContextAdapter arg1) {
        log.info("Everything smooth --> mapUserToContext");
    }

    @Override
    public Collection<?extends GrantedAuthority> getGrantedAuthorities(
        DirContextOperations arg0, String arg1) {
        log.info("Everything smooth --> getGrantedAuthorities");

        return null;
    }
}
