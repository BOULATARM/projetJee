package com.lias.security;

import com.lias.entity.Membre;
import com.lias.enums.RoleSysteme;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long membreId;
    private final String email;
    private final String password;
    private final RoleSysteme role;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Membre membre) {
        this.membreId = membre.getId();
        this.email = membre.getEmail();
        this.password = membre.getMotDePasse();
        this.role = membre.getSystemRole();
        this.authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + membre.getSystemRole().name()));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
