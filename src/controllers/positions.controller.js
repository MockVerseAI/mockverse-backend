import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Interview } from "../models/interview.model.js";
import { Application } from "../models/application.model.js";

const getAllPositions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { search = "" } = req.query;

  const query = [
    {
      $match: {
        userId,
        $or: [
          { companyName: { $regex: search, $options: "i" } },
          { jobRole: { $regex: search, $options: "i" } },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        companyName: 1,
        jobRole: 1,
        jobDescription: 1,
      },
    },
  ];

  const [interviews, applications] = await Promise.all([
    Interview.aggregate(query),
    Application.aggregate(query),
  ]);

  const uniquePositions = new Set([...interviews, ...applications]);

  const positions = Array.from(uniquePositions);

  return res
    .status(200)
    .json(
      new ApiResponse(200, positions, "All positions fetched successfully")
    );
});

export { getAllPositions };
