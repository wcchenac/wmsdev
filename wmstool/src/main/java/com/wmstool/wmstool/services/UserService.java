package com.wmstool.wmstool.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.wmstool.wmstool.models.Role;
import com.wmstool.wmstool.models.RoleName;
import com.wmstool.wmstool.models.User;
import com.wmstool.wmstool.models.payloads.LoginRequest;
import com.wmstool.wmstool.models.payloads.UpdateUserRequest;
import com.wmstool.wmstool.repositories.RoleRepository;
import com.wmstool.wmstool.repositories.UserRepository;
import com.wmstool.wmstool.security.JwtTokenProvider;

@Service
@Transactional
public class UserService {

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtTokenProvider jwtTokenProvider;

	public String authentiacateUser(LoginRequest loginRequest) {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginRequest.getEmployeeId(), loginRequest.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);

		String jwt = jwtTokenProvider.generateToken(authentication);

		return jwt;
	}

	// Return an object list with users information
	public List<Map<String, String>> getUserList() {
		List<Map<String, String>> result = new ArrayList<>();

		userRepository.findAll().forEach(user -> {
			Map<String, String> newUser = new HashMap<>();

			newUser.put("employeeId", user.getEmployeeId());
			newUser.put("fullName", user.getFullName());
			newUser.put("role", rolenameResolve(user.getRole()));

			result.add(newUser);
		});

		return result;
	}

	// Return true if update process success; otherwise, return false
	public boolean updateUserInfo(UpdateUserRequest updateUserRequest) {
		// TODO: data not found
		try {
			User user = userRepository.findByEmployeeId(updateUserRequest.getEmployeeId()).get();

			if (updateUserRequest.getNewPassword() != null) {
				user.setPassword(passwordEncoder.encode(updateUserRequest.getNewPassword()));
			}
			if (!user.getFullName().equals(updateUserRequest.getFullName())) {
				user.setFullName(updateUserRequest.getFullName());
			}
			if (!RoleName.valueOf(updateUserRequest.getRole()).equals(user.getRole().getRole())) {
				user.setRole(roleRepository.findByRole(RoleName.valueOf(updateUserRequest.getRole())).get());
			}

			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public boolean deleteUser(String employeeId) {
		try {
			userRepository.deleteByEmployeeId(employeeId);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	private String rolenameResolve(Role role) {
		switch (role.getRole()) {
		case ROLE_Admin:
			return "管理員";
		case ROLE_Normal:
			return "一般人員/門市";
		case ROLE_Operator:
			return "庫存相關人員";
		case ROLE_Sales:
			return "業務";
		default:
			return "ERROR";
		}
	}
}
