package com.wmstool.wmstool.controllers;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wmstool.wmstool.models.Role;
import com.wmstool.wmstool.models.RoleName;
import com.wmstool.wmstool.models.User;
import com.wmstool.wmstool.models.payloads.ApiResponse;
import com.wmstool.wmstool.models.payloads.JwtAuthenticationResponse;
import com.wmstool.wmstool.models.payloads.LoginRequest;
import com.wmstool.wmstool.models.payloads.RegisterRequest;
import com.wmstool.wmstool.models.payloads.UpdateUserRequest;
import com.wmstool.wmstool.repositories.RoleRepository;
import com.wmstool.wmstool.repositories.UserRepository;
import com.wmstool.wmstool.services.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {

	@Autowired
	private UserService userService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@PostMapping("/login")
	public ResponseEntity<?> authentiacateUser(@Valid @RequestBody LoginRequest loginRequest) {
		return ResponseEntity.ok(new JwtAuthenticationResponse(userService.authentiacateUser(loginRequest)));
	}

	@PreAuthorize("hasRole('ROLE_Admin')")
	@PostMapping("/adminManagement/user/register")
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
			userRepository.save(user);

			return new ResponseEntity<String>("Success", HttpStatus.CREATED);
		} else {
			return new ResponseEntity<>(new ApiResponse(false, "Role setting error"), HttpStatus.BAD_REQUEST);
		}
	}

	@PreAuthorize("hasRole('ROLE_Admin')")
	@GetMapping("/adminManagement/user/userList")
	public ResponseEntity<?> getUserList() {
		return new ResponseEntity<List<Map<String, String>>>(userService.getUserList(), HttpStatus.OK);
	}

	@PreAuthorize("hasRole('ROLE_Admin')")
	@PatchMapping("/adminManagement/user/update")
	public ResponseEntity<?> updateUser(@RequestBody UpdateUserRequest updateUserRequest) {
		if (userService.updateUserInfo(updateUserRequest)) {
			return new ResponseEntity<>(HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}

	}

	@PreAuthorize("hasRole('ROLE_Admin')")
	@DeleteMapping("/adminManagement/user/delete")
	public ResponseEntity<?> deleteUser(@RequestParam(value = "employeeId") String employeeId) {
		if (userService.deleteUser(employeeId)) {
			return new ResponseEntity<>(HttpStatus.OK);
		} else {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

}
