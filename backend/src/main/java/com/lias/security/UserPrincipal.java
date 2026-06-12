package com.lias.security;

import com.lias.entity.Membre;
import com.lias.enums.RoleSysteme;
import com.lias.enums.StatutMembre;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long membreId;
    private final String email;
    private final String password;
    private final RoleSysteme role;
    private final StatutMembre statut;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Membre membre) {
        this.membreId = membre.getId();
        this.email = membre.getEmail();
        this.password = membre.getMotDePasse();
        this.role = membre.getSystemRole();
        this.statut = membre.getStatut();
        List<SimpleGrantedAuthority> auths = new ArrayList<>();
        auths.add(new SimpleGrantedAuthority("ROLE_" + membre.getSystemRole().name()));
        if (membre.getStatut() != null) {
            auths.add(new SimpleGrantedAuthority("STATUT_" + membre.getStatut().name()));
        }
        this.authorities = auths;
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
