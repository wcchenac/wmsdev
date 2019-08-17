package com.wmstool.services;

import java.util.ArrayList;
import java.util.Arrays;
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

	public ClothInfo createClothInfo(ClothIdentifier clothIdentifier, ClothInfo info, ClothRecord[] records) {
		ClothInfo res = clothInfoRepository.save(new ClothInfo(clothIdentifier, info));
		List<ClothRecord> recordList = new ArrayList<>();
		Arrays.asList(records).stream().forEach(r -> {
			r.setClothInfo(res);
			recordList.add(clothRecordRepository.save(r));
		});
		res.setClothRecords(recordList);
		return clothInfoRepository.save(res);
	}

	public List<ClothInfo> findClothInfoByProductNo(String productNo) {
		List<ClothIdentifier> res = clothIdentifierRepo.findByProductNoAndIsExist(productNo, true).orElse(null);
		List<ClothInfo> result = new ArrayList<>();
		res.stream().forEach(identifier -> result.add(clothInfoRepository.findById(identifier.getId()).get()));
		return result;
	}
}
