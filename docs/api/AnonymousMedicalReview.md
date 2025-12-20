# AnonymousMedicalReview API Reference

## Functions

### registerDoctor

```solidity
function registerDoctor(
        string memory _name,
        string memory _specialty,
        string memory _clinic
    )
```

### submitAnonymousReview

```solidity
function submitAnonymousReview(
        uint256 _doctorId,
        uint8 _rating,
        uint8 _professionalism,
        uint8 _communication,
        uint8 _waitTime,
        string memory _encryptedComment
    )
```

### requestRatingAggregation

```solidity
function requestRatingAggregation(uint256 _doctorId)
```

### processAggregation

```solidity
function processAggregation(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    )
```

### getDoctorInfo

```solidity
function getDoctorInfo(uint256 _doctorId) returns (
        string memory name,
        string memory specialty,
        string memory clinic,
        uint256 totalReviews,
        uint256 registrationTime
    )
```

### getDoctorRating

```solidity
function getDoctorRating(uint256 _doctorId) returns (
        uint8 averageRating,
        uint8 averageProfessionalism,
        uint8 averageCommunication,
        uint8 averageWaitTime,
        uint256 totalReviews,
        uint256 lastUpdated,
        bool isRevealed
    )
```

### getReviewStatus

```solidity
function getReviewStatus(address _reviewer, uint256 _doctorId) returns (bool)
```

### getDoctorReviewCount

```solidity
function getDoctorReviewCount(uint256 _doctorId) returns (uint256)
```

### getAllDoctorsCount

```solidity
function getAllDoctorsCount() returns (uint256)
```

### getTotalReviewsCount

```solidity
function getTotalReviewsCount() returns (uint256)
```

### canRequestAggregation

```solidity
function canRequestAggregation(uint256 _doctorId) returns (bool)
```

### updatePlatformAddress

```solidity
function updatePlatformAddress(address _newPlatform)
```

## Events

### DoctorRegistered

```solidity
event DoctorRegistered(uint256 indexed doctorId, string name, string specialty)
```

### ReviewSubmitted

```solidity
event ReviewSubmitted(uint256 indexed reviewId, uint256 indexed doctorId, address indexed reviewer)
```

### RatingRevealed

```solidity
event RatingRevealed(uint256 indexed doctorId, uint8 averageRating, uint256 totalReviews)
```

### AggregationRequested

```solidity
event AggregationRequested(uint256 indexed doctorId, uint256 reviewCount)
```

