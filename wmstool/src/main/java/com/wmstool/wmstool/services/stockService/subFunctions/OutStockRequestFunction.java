package com.wmstool.wmstool.services.stockService.subFunctions;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.wmstool.wmstool.models.OutStockRequest;
import com.wmstool.wmstool.models.payloads.HandleListResponse;
import com.wmstool.wmstool.models.payloads.OutStockUpdateRequest;
import com.wmstool.wmstool.repositories.OutStockRequestRepo;
import com.wmstool.wmstool.security.UserPrincipal;
import com.wmstool.wmstool.utilities.OutStockRequestExcelHelper;

@Component
public class OutStockRequestFunction {

	@Autowired
	private OutStockRequestRepo outStockRequestRepo;

	@Autowired
	private OutStockRequestExcelHelper outStockRequestExcelHelper;

	/**
	 * Save a special outStockRequest to repository
	 */
	public OutStockRequest createOutStockRequest(OutStockRequest outStockRequest) {
		String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
				.getFullName();
		outStockRequest.setOutStockType(2);
		outStockRequest.setCreatedBy(Editor);

		return outStockRequestRepo.save(outStockRequest);
	}

	/**
	 * Delete method for special outStockRequest
	 */
	public void deleteOutStockRequest(long outStockRequestId) {
		// TODO: data not found exception
		OutStockRequest resOutStockRequest = outStockRequestRepo.findById(outStockRequestId).get();
		String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
				.getFullName();

		resOutStockRequest.setDeleted(true);
		resOutStockRequest.setUpdatedBy(Editor);
	}

	/**
	 * Return a response containing a list of waitHandle records created at 'today'
	 * in outStockRequest repository and a list of create users collected in
	 * previous list
	 */
	public HandleListResponse getOutStockWaitHandleList() {
		LocalDateTime today = LocalDate.now().atStartOfDay();

		Specification<OutStockRequest> specification = (Specification<OutStockRequest>) (root, query,
				criteriaBuilder) -> {
			List<Predicate> predicatesList = new ArrayList<>();

			Predicate deletePredicate = criteriaBuilder.isFalse(root.get("isDeleted"));
			predicatesList.add(deletePredicate);

			if (today != null) {
				Predicate startFromPredicate = criteriaBuilder.greaterThan(root.get("createdAt"), today);
				predicatesList.add(startFromPredicate);
			}

			// order by outStock productNo then order by type
			query.orderBy(criteriaBuilder.asc(root.get("productNo")), criteriaBuilder.asc(root.get("type")));

			Predicate[] predicates = new Predicate[predicatesList.size()];

			return criteriaBuilder.and(predicatesList.toArray(predicates));
		};

		// query results after filter
		List<OutStockRequest> resultList = outStockRequestRepo.findAll(specification);

		Map<String, List<OutStockRequest>> resultMap = new HashMap<>();
		Set<String> userSet = new HashSet<>();
		DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

		// store the results at the certain day in the Map
		resultMap.put(today.format(formatter), resultList);

		// collect all users showing within createdBy attribute
		resultList.forEach(outStockRequest -> userSet.add(outStockRequest.getCreatedBy()));

		return new HandleListResponse(new ArrayList<>(userSet), resultMap);
	}

	/**
	 * Return a response containing a list of waitHandle records created between
	 * 'start' and 'end' in outStockRequest repository and a list of create users
	 * collected in previous list
	 */
	public HandleListResponse getOutStockWaitHandleListWithTimeInterval(String start, String end) {
		LocalDateTime startDateTime = LocalDateTime.parse(start, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);
		LocalDateTime endDateTime = LocalDateTime.parse(end, DateTimeFormatter.ISO_LOCAL_DATE_TIME).plusHours(8);

		Specification<OutStockRequest> specification = (Specification<OutStockRequest>) (root, query,
				criteriaBuilder) -> {
			List<Predicate> predicatesList = new ArrayList<>();

			Predicate deletePredicate = criteriaBuilder.isFalse(root.get("isDeleted"));
			predicatesList.add(deletePredicate);

			if (startDateTime != null && endDateTime != null) {
				Predicate startFromPredicate = criteriaBuilder.between(root.get("createdAt"), startDateTime,
						endDateTime);
				predicatesList.add(startFromPredicate);
			}

			// order by outStock productNo then order by type
			query.orderBy(criteriaBuilder.asc(root.get("productNo")), criteriaBuilder.asc(root.get("type")));

			Predicate[] predicates = new Predicate[predicatesList.size()];

			return criteriaBuilder.and(predicatesList.toArray(predicates));
		};

		// query results after filter
		List<OutStockRequest> resultList = outStockRequestRepo.findAll(specification);

		List<LocalDate> dateList = new ArrayList<>();
		Map<String, List<OutStockRequest>> resultMap = new HashMap<>();
		Set<String> userSet = new HashSet<>();

		// create a date list containing days between start and end
		Period period = Period.between(startDateTime.toLocalDate(), endDateTime.toLocalDate());
		int dayInterval = period.getDays();

		for (int i = 0; i <= dayInterval; i += 1) {
			LocalDate d = startDateTime.plusDays(i).toLocalDate();
			dateList.add(d);
		}

		// filter the requests with given date and store the filter results in the Map
		dateList.forEach(date -> {
			List<OutStockRequest> filterResultList = resultList.stream()
					.filter(outStockRequest -> outStockRequest.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)
							.equals(date.format(DateTimeFormatter.ISO_LOCAL_DATE)))
					.collect(Collectors.toList());
			resultMap.put(date.format(DateTimeFormatter.ISO_LOCAL_DATE), filterResultList);
		});

		// collect all users showing within createdBy attribute
		resultList.forEach(outStockRequest -> userSet.add(outStockRequest.getCreatedBy()));

		return new HandleListResponse(new ArrayList<>(userSet), resultMap);
	}

	/**
	 * Update outStockRequest using given outStockUpdateRequest, and create excel at
	 * server for user download
	 */
	public void updateOutStockRequest(OutStockUpdateRequest outStockUpdateRequest) throws IOException {
		Map<Long, String> updateRequest = outStockUpdateRequest.getOutStockUpdate();
		List<OutStockRequest> tempList = new ArrayList<>();
		LocalDateTime now = LocalDateTime.now();

		// Create a excel for this updateRequest for later modification
		String fileName = outStockRequestExcelHelper.createNewFile(now);

		// Use id stored in update request as key to update database
		updateRequest.keySet().forEach(id -> {
			// TODO: data not found exception
			OutStockRequest res = outStockRequestRepo.findById(id).get();
			String Editor = ((UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
					.getFullName();

			res.setRequestFrom(updateRequest.get(id));
			res.setHandled(true);
			res.setFileName(fileName);
			res.setUpdatedBy(Editor);
			tempList.add(res);
		});

		// write res information into excel
		try {
			outStockRequestExcelHelper.modifyExisting(tempList, now, fileName);
		} catch (Exception e) {
			e.printStackTrace();
		}

	}
}
