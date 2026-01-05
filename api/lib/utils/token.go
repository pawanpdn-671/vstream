package utils

import (
	"errors"
	"net/http"
	"os"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

type SignedDetails struct {
	Email     string
	FirstName string
	LastName  string
	Role      string
	UserId    string
	jwt.RegisteredClaims
}

var SECRET_KEY = os.Getenv("JWT_SECRET_KEY")
var REFRESH_SECRET_KEY = os.Getenv("JWT_REFRESH_SECRET_KEY")

func GenerateAllToken(email, firstName, lastName, role, userId string) (string, string, error) {
	// Ensure keys are loaded (in case they weren't at init time)
	if SECRET_KEY == "" {
		SECRET_KEY = os.Getenv("JWT_SECRET_KEY")
	}
	if REFRESH_SECRET_KEY == "" {
		REFRESH_SECRET_KEY = os.Getenv("JWT_REFRESH_SECRET_KEY")
	}

	// Access token claims
	claims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		UserId:    userId,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "VStream",
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(TokenExpirationTime)),
		},
	}

	// Refresh token claims (longer validity)
	refreshClaims := &SignedDetails{
		Email:  email,
		UserId: userId,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "VStream",
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(RefreshTokenExpirationTime)),
		},
	}

	// Generate access token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(SECRET_KEY))
	if err != nil {
		return "", "", err
	}

	// Generate refresh token
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString([]byte(REFRESH_SECRET_KEY))
	if err != nil {
		return "", "", err
	}

	return signedToken, signedRefreshToken, nil
}

// GetAccessToken extracts the access token from the request cookies
func GetAccessToken(r *http.Request) (string, error) {
	cookie, err := r.Cookie("access_token")
	if err != nil {
		return "", errors.New("access token cookie not found")
	}

	if cookie.Value == "" {
		return "", errors.New("access token is empty")
	}

	return cookie.Value, nil
}

// GetRefreshToken extracts the refresh token from the request cookies
func GetRefreshToken(r *http.Request) (string, error) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		return "", errors.New("refresh token cookie not found")
	}

	if cookie.Value == "" {
		return "", errors.New("refresh token is empty")
	}

	return cookie.Value, nil
}

func ValidateToken(tokenString string) (*SignedDetails, error) {
	if SECRET_KEY == "" {
		SECRET_KEY = os.Getenv("JWT_SECRET_KEY")
	}

	claims := &SignedDetails{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(SECRET_KEY), nil
	})

	if err != nil {
		return nil, err
	}

	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, errors.New("invalid signing method")
	}

	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("token has expired")
	}

	return claims, nil
}

func ValidateRefreshToken(tokenString string) (*SignedDetails, error) {
	if REFRESH_SECRET_KEY == "" {
		REFRESH_SECRET_KEY = os.Getenv("JWT_REFRESH_SECRET_KEY")
	}

	claims := &SignedDetails{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(REFRESH_SECRET_KEY), nil
	})

	if err != nil {
		return nil, err
	}

	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, errors.New("invalid signing method")
	}

	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("refresh token has expired")
	}

	return claims, nil
}
