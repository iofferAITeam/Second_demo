import Image from 'next/image'

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-text">
          <h1>Stop Guessing<br />Secure Your Offer</h1>
          <p className="subtitle">Driven by AI, designed for your unique profile</p>
          <p className="description">
            Discover where you truly belong by comparing your application profile against thousands of students who got accepted.
          </p>

          <ul className="features">
            <li>5 min to find your best-fit college programs</li>
            <li>3X More Likely to Get Accepted</li>
            <li>50,000+ successful application data powering your match</li>
          </ul>
        </div>

        <div className="form-area">
          <div className="figma-characters" style={{textAlign: 'center', marginBottom: '-10px'}}>
            <Image
              src="/images/characters.png"
              alt="Four Cartoon Characters"
              width={200}
              height={80}
              style={{height: '80px', width: 'auto'}}
            />
          </div>

          <div className="form-container">
            <h3>Get Your Personalized School Recommendations</h3>
            <p className="subtitle">
              Share a bit about your academic profile and we'll match you with schools where you're most likely to succeed!
            </p>

            <form>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="degree">Desired degree</label>
                  <select id="degree" name="degree">
                    <option value="">Please Select</option>
                    <option value="bachelor">Bachelor's</option>
                    <option value="master">Master's</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country of interest</label>
                  <select id="country" name="country">
                    <option value="">Please Select</option>
                    <option value="usa">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="canada">Canada</option>
                    <option value="australia">Australia</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="program">Your desired major / program</label>
                <input type="text" id="program" name="program" placeholder="e.g. Computer Science" />
              </div>

              <div className="form-group">
                <label htmlFor="about">Tell us a bit about yourself!</label>
                <textarea
                  id="about"
                  name="about"
                  placeholder="Share your interests, goals, and any preferences..."
                ></textarea>
              </div>

              <button type="submit" className="generate-button">
                Generate My Free School Match Report
              </button>
            </form>

            <a href="#" className="discover-link">Discover More</a>
          </div>
        </div>
      </div>
    </section>
  )
}