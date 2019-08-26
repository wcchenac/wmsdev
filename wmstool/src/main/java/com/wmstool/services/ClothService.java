package com.wmstool.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wmstool.models.ClothIdentifier;
import com.wmstool.models.ClothIdentifierBacklog;
import com.wmstool.models.ClothInfo;
import com.wmstool.models.ClothRecord;
import com.wmstool.repositories.ClothIdentifierBacklogRepo;
import com.wmstool.repositories.ClothIdentifierRepo;
import com.wmstool.repositories.ClothInfoRepository;
import com.wmstool.repositories.ClothRecordRepository;

@Service
public class ClothService {

	// Manupilating pull request will help you to see what code you change, like this. And it is easy to track.
	// Allow to to see what change you do on this feature branch at any time.

	@Autowired
	private ClothIdentifierRepo clothIdentifierRepo;

	@Autowired
	private ClothIdentifierBacklogRepo clothIdentifierBacklogRepo;

	@Autowired
	private ClothInfoRepository clothInfoRepository;

	@Autowired
	private ClothRecordRepository clothRecordRepository;

	public ClothIdentifier createClothIdentifier(ClothIdentifierBacklog clothIdentifierBacklog) {
		ClothIdentifierBacklog res = clothIdentifierBacklogRepo
				.findByProductNoAndLotNoAndTypeAndLength(clothIdentifierBacklog.getProductNo(),
						clothIdentifierBacklog.getLotNo(), clothIdentifierBacklog.getType(),
						clothIdentifierBacklog.getLength())
				.orElseGet(() -> clothIdentifierBacklogRepo.save(clothIdentifierBacklog));

		ClothIdentifier clothIdentifier = new ClothIdentifier(res);

		int newSerialNo = res.getSerialNo() + 1;
		res.setSerialNo((short) newSerialNo);

		return clothIdentifierRepo.save(clothIdentifier);
	}

	public ClothInfo createClothInfo(ClothIdentifier clothIdentifier, ClothInfo info, ClothRecord records) {
		ClothInfo info_res = clothInfoRepository.save(new ClothInfo(clothIdentifier, info));
		ClothRecord record_res = clothRecordRepository.save(new ClothRecord(records, info_res));
		info_res.setClothRecords(record_res);
		return clothInfoRepository.save(info_res);
	}

	public List<ClothInfo> findClothInfoByProductNo(String productNo) {
		List<ClothInfo> result = new ArrayList<>();
		List<ClothIdentifier> res = new ArrayList<>();
		res = clothIdentifierRepo.findByProductNoAndIsExist(productNo, true).orElse(res);
		if (!res.isEmpty()) {
			res.stream().forEach(identifier -> result.add(clothInfoRepository.findById(identifier.getId()).get()));
		}
		return result;
	}
}
