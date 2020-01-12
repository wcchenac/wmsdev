package com.wmstool.wmstool.controllers;

import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.wmstool.models.Role;
import com.wmstool.wmstool.models.RoleName;
import com.wmstool.wmstool.models.User;
import com.wmstool.wmstool.models.payloads.ApiResponse;
import com.wmstool.wmstool.models.payloads.JwtAuthenticationResponse;
import com.wmstool.wmstool.models.payloads.LoginRequest;
import com.wmstool.wmstool.models.payloads.RegisterRequest;
import com.wmstool.wmstool.repositories.RoleRepository;
import com.wmstool.wmstool.repositories.UserRepository;
import com.wmstool.wmstool.security.JwtTokenProvider;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

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

	@PostMapping("/login")
	public ResponseEntity<?> authentiacateUser(@Valid @RequestBody LoginRequest loginRequest) {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginRequest.getEmployeeId(), loginRequest.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);

		String jwt = jwtTokenProvider.generateToken(authentication);

		return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
	}

//	@PreAuthorize("hasRole('Role_Admin')")
	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
		if (userRepository.existsByEmployeeId(registerRequest.getEmployeeId())) {
			return new ResponseEntity<>(new ApiResponse(false, "EmployeeId is already exists!"),
					HttpStatus.BAD_REQUEST);
		}

		User user = new User(registerRequest.getEmployeeId(), registerRequest.getFullName(),
				passwordEncoder.encode(registerRequest.getPassword()));

		Optional<Role> userRole = roleRepository.findByRole(RoleName.valueOf(registerRequest.getRole()));

		if (userRole.isPresent()) {
			user.setRole(userRole.get());
		} else {
			return new ResponseEntity<>(new ApiResponse(false, "Role setting error"), HttpStatus.BAD_REQUEST);
		}

		userRepository.save(user);

		return new ResponseEntity<String>("Success", HttpStatus.CREATED);
	}

}
