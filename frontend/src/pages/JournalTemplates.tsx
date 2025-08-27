import { useEffect } from 'react';
import { useJournalStore } from '@/stores/journal.store';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/Loader';

export default function JournalTemplates() {
  const { journalTemplates, fetchJournalTemplates } = useJournalStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJournalTemplates();
  }, [fetchJournalTemplates]);

  if (!journalTemplates) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Journal Templates</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Go Back</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {journalTemplates.map((template) => (
          <Card key={template._id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <h3 className="text-xl font-bold mb-2">Prompts</h3>
                {
                  template.prompts.length === 0 ? 
                  (<p className="text-s italic">No prompts available.</p>) : 
                  (template.prompts.map((prompt, index) => (
                    <p key={index} className="text-s text-gray-400 line-clamp-3">{prompt}</p>
                  )))
                }
              </div>
              <div className="mb-2">
                <h3 className="text-xl font-bold mb-2">Benefits</h3>
                {
                  template.benefits.length === 0 ? 
                  (<p className="text-s italic">No benefits available.</p>) : 
                  (template.benefits.map((benefit, index) => (
                    <p key={index} className="text-s text-gray-400 line-clamp-3">{benefit}</p>
                  )))
                }
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/journal/new?templateId=${template._id}`}>
                <Button variant="outline" className='text-accent'>Use Template</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
