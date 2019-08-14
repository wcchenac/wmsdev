package com.wmstool.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wmstool.models.ClothIdentifier;
import com.wmstool.models.ClothIdentifierBacklog;
import com.wmstool.repositories.ClothIdentifierBacklogRepo;
import com.wmstool.repositories.ClothIdentifierRepo;

@Service
public class ClothService {

	@Autowired
	private ClothIdentifierRepo clothIdentifierRepo;

	@Autowired
	private ClothIdentifierBacklogRepo clothIdentifierBacklogRepo;

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

}
