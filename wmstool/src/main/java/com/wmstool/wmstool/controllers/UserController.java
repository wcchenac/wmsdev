package com.wmstool.wmstool.controllers;

import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
@RequestMapping("/api/user")
public class UserController {

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
	@PostMapping("/adminManagement/register")
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

	@PreAuthorize("hasRole('Role_Admin')")
	@GetMapping("/adminManagement/userList")
	public ResponseEntity<?> getUserList() {
		return new ResponseEntity<Page<User>>(
				userRepository.findAll(PageRequest.of(0, 15, Sort.by(Direction.DESC, "id"))), HttpStatus.OK);
	}

	@PreAuthorize("hasRole('Role_Admin')")
	@PatchMapping("/adminManagement/update")
	public ResponseEntity<?> updateUser() {
		return null;
	}

	@PreAuthorize("hasRole('Role_Admin')")
	@DeleteMapping("/adminManagement/delete/{userId}")
	public ResponseEntity<?> deleteUser(@PathVariable long userId) {
		userRepository.deleteById(userId);
		return ResponseEntity.ok("Done");
	}

}
