package com.sample.maven.security;

import lombok.Getter;
import lombok.Setter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;


@Getter
@Setter
public class SampleUser extends User {
    private static final long serialVersionUID = 1L;
    private String guid;
    private String firstName;
    private String lastName;
    private String department;
    private String email;

    public SampleUser(final String username, final String password,
        final boolean enabled, final boolean accountNonExpired,
        final boolean credentialsNonExpired, final boolean accountNonLocked,
        final Collection<?extends GrantedAuthority> authorities) {
        super(username, password, enabled, accountNonExpired,
            credentialsNonExpired, accountNonLocked, authorities);
    }
}
