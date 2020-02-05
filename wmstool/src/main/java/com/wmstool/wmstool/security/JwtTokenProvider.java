package com.wmstool.wmstool.security;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;

@Component
public class JwtTokenProvider {

	private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

	@Value("${jwt.jwtSecret}")
	private String jwtSecret;

	@Value("${jwt.jwtExpirationInMs}")
	private long jwtExpirationTime;

	// Generate token
	public String generateToken(Authentication authentication) {
		UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + jwtExpirationTime);
		String userId = Long.toString(userPrincipal.getId());
		Map<String, Object> claims = new HashMap<>();

		claims.put("id", userId);
		claims.put("employeeId", userPrincipal.getUsername());
		claims.put("fullName", userPrincipal.getFullName());
		claims.put("role", userPrincipal.getAuthorities().toArray()[0]);

		return Jwts.builder().setSubject(userId).setClaims(claims).setIssuedAt(now).setExpiration(expiryDate)
				.signWith(SignatureAlgorithm.HS512, jwtSecret).compact();
	}

	// Validate token
	public boolean validateToken(String token) {
		try {
			Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);

			return true;
		} catch (SignatureException ex) {
			logger.error("Invalid JWT signature");
		} catch (MalformedJwtException ex) {
			logger.error("Invalid JWT token");
		} catch (ExpiredJwtException ex) {
			logger.error("Expired JWT token");
		} catch (UnsupportedJwtException ex) {
			logger.error("Unsupported JWT token");
		} catch (IllegalArgumentException ex) {
			logger.error("JWT claims string is empty.");
		}

		return false;
	}

	// Get userId from token
	public Long getUserIdFromJwt(String token) {
		Claims claims = Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody();

		return Long.parseLong((String) claims.get("id"));
	}
}
