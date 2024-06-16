//import { process } from './env'; // Correct path to env.js
import openai from 'openai';

const setupInputContainer = document.getElementById('setup-input-container');
const movieBossText = document.getElementById('movie-boss-text');
const sendBtn = document.getElementById('send-btn');

const apiKey = process.env.OPENAI_API_KEY;

// Initialize OpenAI API instance
const openaiInstance = new openai({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
    baseUrl: 'https://api.openai.com/v1', // Specify the base URL for API requests
});

sendBtn.addEventListener('click', async () => {
    const setupTextarea = document.getElementById('setuptextarea'); // Corrected ID reference
    const userInput = setupTextarea.value.trim(); // Get the user input from textarea
    if (userInput) {
        // Clear previous content
        setupInputContainer.innerHTML = '';

        // Create a wrapper div for centering content vertically
        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.display = 'flex';
        wrapperDiv.style.alignItems = 'center'; // Align items vertically in the center
        wrapperDiv.style.justifyContent = 'center'; // Align items horizontally in the center

        // Add boss_baby image
        const bossBabyImg = document.createElement('img');
        bossBabyImg.src = 'images/my_image.png'; // Replace with your actual image path
        bossBabyImg.alt = 'Boss Baby Image';
        bossBabyImg.style.maxWidth = '100%'; // Set maximum width to fit container
        wrapperDiv.appendChild(bossBabyImg);

        // Add loading SVG
        const loadingImg = document.createElement('img');
        loadingImg.src = 'images/loading.svg';
        loadingImg.classList.add('loading'); // Optional: Add a class for styling
        loadingImg.id = 'loading';
        wrapperDiv.appendChild(loadingImg);

        // Append the wrapperDiv to setupInputContainer
        setupInputContainer.appendChild(wrapperDiv);

        // Add text message
        movieBossText.innerText = 'Ok, just wait a second while my digital brain digests that...';
        fetchBotReply(userInput);
        fetchSynopsis(userInput);
    } else {
        alert('Please enter some text before sending.'); // Optionally provide user feedback
    }
});

async function fetchBotReply(outline) {
    try {
        const response = await openaiInstance.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: `Generate a short message to enthusiastically say "${outline}" sounds interesting and that you need some minutes to think about it. Mention one aspect of the sentence.
            ###
            outline: Two dogs fall in love and move to Hawaii to learn to surf.
            message: I'll need to think about that. But your idea is amazing! I love the bit about Hawaii!
            ###
            outline: A plane crashes in the jungle and the passengers have to walk 1000km to safety.
            message: I'll spend a few moments considering that. But I love your idea!! A disaster movie in the jungle!
            ###
            outline: A group of corrupt lawyers try to send an innocent woman to jail/
            message: Wow that is awesome! Corrupt lawyers, huh? Give me a few moments to think!
            ###
            outline: ${outline}
            message:
            `,
            max_tokens: 60
        });
        movieBossText.innerText = response.choices[0].text.trim();
    } catch (error) {
        console.error('Error fetching completion:', error);
        movieBossText.innerText = 'Error: Unable to fetch response.';
    }
}

async function fetchSynopsis(outline) {
    try {
        const response = await openaiInstance.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: `Generate an engaging, professional and marketable movie synopsis based on an outline. The synopsis should include actors names in brackets after each character. Choose actors that would be ideal for this role.
            ###
            outline: A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
            synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
            ###
            outline: ${outline}
            synopsis:
            `,
            max_tokens: 700
        });
        const outputTextElement = document.getElementById('output-text');
        const synopsis = response.choices[0].text.trim();
        if (outputTextElement) {
            outputTextElement.innerText = synopsis;
            fetchTitle(synopsis);
            fetchStars(synopsis);
        } else {
            console.error('Output text element not found.');
        }
    } catch (error) {
        console.error('Error fetching synopsis:', error);
        const outputTextElement = document.getElementById('output-text');
        if (outputTextElement) {
            outputTextElement.innerText = 'Error: Unable to fetch synopsis.';
        } else {
            console.error('Output text element not found.');
        }
    }
}

async function fetchTitle(synopsis) {
    try {
        const response = await openaiInstance.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: `Generate a catchy movie title for this synopsis: ${synopsis}`,
            max_tokens: 25,
            temperature: 0.7
        });
        const outputTitleElement = document.getElementById('output-title');
        if (outputTitleElement) {
            const title = response.choices[0].text.trim()
            outputTitleElement.innerText = title;
            fetchImagePrompt(title, synopsis);
        } else {
            console.error('Output title element not found.');
        }
    } catch (error) {
        console.error('Error fetching title:', error);
        const outputTitleElement = document.getElementById('output-title');
        if (outputTitleElement) {
            outputTitleElement.innerText = 'Error: Unable to fetch title.';
        } else {
            console.error('Output title element not found.');
        }
    }
}

async function fetchStars(synopsis) {
    try {
        const response = await openaiInstance.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: `Extract the names in brackets from the synopsis.
            ###
            synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
            names: Tom Cruise, Val Kilmer, Kelly McGillis
            ###
            synopsis: ${synopsis}
            names:
            `,
            max_tokens: 30,
            temperature: 0.7
        });
        const outputStarsElement = document.getElementById('output-stars');
        if (outputStarsElement) {
            outputStarsElement.innerText = response.choices[0].text.trim();
        } else {
            console.error('Output stars element not found.');
        }
    } catch (error) {
        console.error('Error fetching stars:', error);
        const outputStarsElement = document.getElementById('output-stars');
        if (outputStarsElement) {
            outputStarsElement.innerText = 'Error: Unable to fetch stars.';
        } else {
            console.error('Output stars element not found.');
        }
    }
}

async function fetchImagePrompt(title, synopsis) {
    try {
        const response = await openaiInstance.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: `Give a short description of an image which could be used to advertise a movie based on a title and synopsis. The description should be rich in visual details but contain no names.
            ###
            title: Love's Time Warp
            synopsis: When scientist and time traveler Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.
            image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. A semi-transparent image of war is superimposed over the scene.
            ###
            title: Zero Earth
            synopsis: When bodyguard Kob (Daniel Radcliffe) is recruited by the United Nations to save planet Earth from the sinister Simm (John Malkovich), an alien lord with a plan to take over the world, he reluctantly accepts the challenge. With the help of his loyal sidekick, a brave and resourceful hamster named Gizmo (Gaten Matarazzo), Kob embarks on a perilous mission to destroy Simm. Along the way, he discovers newfound courage and strength as he battles Simm's merciless forces. With the fate of the world in his hands, Kob must find a way to defeat the alien lord and save the planet.
            image description: A tired and bloodied bodyguard and hamster standing atop a tall skyscraper, looking out over a vibrant cityscape, with a rainbow in the sky above them.
            ###
            title: ${title}
            synopsis: ${synopsis}
            image description:
            `,
            max_tokens: 100,
            temperature: 0.8
        });
        fetchImageUrl(response.choices[0].text.trim())
    } catch (error) {
        console.error('Error fetching image description:', error);
    }
}

async function fetchImageUrl(imagePrompt) {
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'dangerouslyAllowBrowser': true,
                'Authorization': `Bearer ${apiKey}` // Ensure your API key is correctly set up
            },
            body: JSON.stringify({
                prompt: `${imagePrompt} There should be no text in this image.`,
                n: 1,
                size: '256x256',
                response_format: 'b64_json'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if the data structure is correct
        if (data.data && data.data.length > 0 && data.data[0].b64_json) {
            const imageUrl = data.data[0].b64_json;
            document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${imageUrl}" alt="Generated Image">`;
            setupInputContainer.innerHTML = `<button`
        } else {
            throw new Error('Invalid response structure');
        }
    } catch (error) {
        console.error('Error fetching image url:', error);
    }
}
