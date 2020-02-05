package com.wmstool.wmstool.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.wmstool.wmstool.models.User;

public class UserPrincipal implements UserDetails {

	private Long id;

	private String employeeId;

	private String fullName;

	@JsonIgnore
	private String password;

	private Collection<? extends GrantedAuthority> authorities;

	public UserPrincipal(Long id, String employeeId, String fullName, String password,
			Collection<? extends GrantedAuthority> authorities) {
		this.id = id;
		this.employeeId = employeeId;
		this.fullName = fullName;
		this.password = password;
		this.authorities = authorities;
	}

	public static UserPrincipal create(User user) {
		List<GrantedAuthority> authorities = new ArrayList<>();

		authorities.add(new SimpleGrantedAuthority(user.getRole().getRole().name()));

		return new UserPrincipal(user.getId(), user.getEmployeeId(), user.getFullName(), user.getPassword(),
				authorities);
	}

	public Long getId() {
		return id;
	}

	public String getFullName() {
		return fullName;
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
		return employeeId;
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

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null || getClass() != obj.getClass())
			return false;
		UserPrincipal that = (UserPrincipal) obj;
		return Objects.equals(id, that.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

}
